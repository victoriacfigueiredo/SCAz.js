(function (sandbox) {
    const { AnalysisParamService } = require('../../services/analysisParamService')
    const { LocationToBranchService} = require('../overriding_assignment/services')

    if (!J$.initParams.extraParams) {
        throw new Error('No extraParams provided')
    }
    const extraParamsObject = AnalysisParamService.decodeParams(J$.initParams.extraParams)

    const LINE_TO_BRANCH_MAP = require(extraParamsObject.lineToBranchMapPath)
    const INPUT_FILE_PATH = extraParamsObject.inputFilePath
    LocationToBranchService.getInstance().setInputs(LINE_TO_BRANCH_MAP, INPUT_FILE_PATH)

    function DataFlowAnalysis() {

        this.latestAssignments = {};
        this.allReads = {};

        this.write = function (iid, name, val, lhs, isGlobal, isScriptLocal) {
            const frameId = sandbox.smemory.getIDFromShadowObjectOrFrame(sandbox.smemory.getShadowFrame(name))
            const location = J$.iidToLocation(J$.sid, iid)
            const branch = LocationToBranchService.getInstance().mapLocationLineRangeToBranch(location)
            const varKey = frameId + name
            this.latestAssignments[varKey] = {
                name: name, 
                value: val,         
                branch: branch,
                location: location
            };
            // console.log(`[write] latestAssignments:`, this.latestAssignments);
            return {result: val};
        };

        this.putField = function (iid, base, offset, val, isComputed, isOpAssign) {
            const actualObjectId = sandbox.smemory.getIDFromShadowObjectOrFrame(sandbox.smemory.getShadowObject(base, offset, false).owner)
            const location = J$.iidToLocation(J$.sid, iid)
            const branch = LocationToBranchService.getInstance().mapLocationLineRangeToBranch(location)
            const fieldKey = actualObjectId + offset
            this.latestAssignments[fieldKey] = {
                base: base,
                offset: offset,
                branch: branch,
                value: val,
                location: location
            }
            // console.log(`[putField] latestAssignments:`, this.latestAssignments);
            return {result: val};
        };

        this.read = function (iid, name, val, isGlobal, isScriptLocal) {
            const frameId = sandbox.smemory.getIDFromShadowObjectOrFrame(sandbox.smemory.getShadowFrame(name))
            const location = J$.iidToLocation(J$.sid, iid)
            const branch = LocationToBranchService.getInstance().mapLocationLineRangeToBranch(location)
            const varKey = frameId + name

            if (!this.allReads[varKey]) {
                this.allReads[varKey] = []
            }
            this.allReads[varKey].push({
                name: name, 
                branch: branch,         
                value: val,          
                location: location
            });

            if (this.latestAssignments[varKey] && this.latestAssignments[varKey].branch && this.latestAssignments[varKey].branch !== branch) {
                console.log(`[DF Detected] Variable "${name}" read at ${location} was last written in a different branch.`);
            }

            // console.log(`[read] allReads:`, this.allReads);
            return {result: val};
        };

        this.getField = function (iid, base, offset, val, isComputed, isOpAssign, isMethodCall) {
            const actualObjectId = sandbox.smemory.getIDFromShadowObjectOrFrame(sandbox.smemory.getShadowObject(base, offset, false).owner)
            const location = J$.iidToLocation(J$.sid, iid)
            const branch = LocationToBranchService.getInstance().mapLocationLineRangeToBranch(location)
            const fieldKey = actualObjectId + offset

            if (!this.allReads[fieldKey]) {
                this.allReads[fieldKey] = []
            }
            this.allReads[fieldKey].push({
                base: base,
                offset: offset, 
                branch: branch,         
                value: val,          
                location: location
            });

            if (this.latestAssignments[fieldKey] && this.latestAssignments[fieldKey].branch && this.latestAssignments[fieldKey].branch !== branch) {
                console.log(`[DF Detected] Field "${offset}" of object read at ${location} was last written in a different branch.`);
            }

            // console.log(`[getField] allReads:`, this.allReads);
            return {result: val};
        };

        this.invokeFunPre = function (iid, f, base, args, isConstructor, isMethod, functionIid, functionSid) {
            return {f: f, base: base, args: args, skip: false};
        };

        this.invokeFun = function (iid, f, base, args, result, isConstructor, isMethod, functionIid, functionSid) {
            return {result: result};
        };

        this.endExecution = function () {
            console.log(`[endExecution] Analysis finished`);
        };
    }

    sandbox.analysis = new DataFlowAnalysis();

}(J$));
