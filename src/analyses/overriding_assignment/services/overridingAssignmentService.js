const {
    FunctionCallStack, Interference
} = require('../models')

class OverridingAssignmentService {
    constructor() {
        this.branchAssignmentSets = {}
        this.functionCallStack = new FunctionCallStack()
        this.interferences = []
    }
    
    functionHandler(func) {
        if ((!this.functionCallStack.isEmpty() || func.getBranch()) && func.isBeforeInvoke()) {
            this.functionCallStack.push(func)
        } else if (!func.isBeforeInvoke()) {
            this.functionCallStack.pop(func)
        }
    }

    _updateAssignBranchBasedOnFunctionStack(assignment) {
        const functionCallStackCurrentBranch = this.functionCallStack.getBranch()
        if (functionCallStackCurrentBranch) {
            assignment.setFunctionCallStack(this.functionCallStack.getCurrentStack())
            if (!assignment.getBranch()) {
                assignment.setBranch(functionCallStackCurrentBranch)
            }
            // if (functionCallStackCurrentBranch !== assignment.getBranch()){
            //     const propagatedFunctionAssignment = new Assignment(assignment.getId(), assignment.getName(), assignment.getLocation(), functionCallStackCurrentBranch, undefined, this.functionCallStack.getCurrentStack())
            //     this.assignmentHandler(propagatedFunctionAssignment)
            // }
        }
    }

    _hasAssignedDifferentValues(prevVal, currVal) {
        const types = ['number', 'string', 'boolean', 'undefined'];
        if (types.includes(typeof prevVal) || types.includes(typeof currVal)) {
            return prevVal !== currVal
        } else {
            // We could possibly compare objects differently, but for now we assume that different references are different objects
            return prevVal !== currVal
        }
    }

    _assignmenteInterfereWithOtherBranch(assignment) {
        const assignmentIdentifier = assignment.getLHSIdentifier()
        const currentBranch = assignment.getBranch()

        for (let branch of Object.keys(this.branchAssignmentSets)) {
            if (branch !== currentBranch && this.branchAssignmentSets[branch][assignmentIdentifier]) {
                const previousAssignment = this.branchAssignmentSets[branch][assignmentIdentifier]
                if (this._hasAssignedDifferentValues(previousAssignment.getVal(), assignment.getVal())) {
                    return new Interference(this.branchAssignmentSets[branch][assignmentIdentifier], assignment)
                }
            }
        }

        return undefined
    }

    _removeAssignmentFromBranch(assignment, branch) {
        const assignmentIdentifier = assignment.getLHSIdentifier()

        if (this.branchAssignmentSets[branch][assignmentIdentifier]) {
            delete this.branchAssignmentSets[branch][assignmentIdentifier]
        }
    }

    _removeAssignmentFromOtherBranches(assignment) {
        const currentBranch = assignment.getBranch()
        const assignmentOnBaseBranch = currentBranch === undefined
        for (let branch of Object.keys(this.branchAssignmentSets)) {
            if (assignmentOnBaseBranch || (!assignmentOnBaseBranch && branch !== currentBranch)) {
                this._removeAssignmentFromBranch(assignment, branch)
            }
        }
    }

    assignmentHandler(assignment) {
        this._updateAssignBranchBasedOnFunctionStack(assignment)
        const currentBranch = assignment.getBranch()
        if (currentBranch) {
            const interference = this._assignmenteInterfereWithOtherBranch(assignment)
            if (interference) {
                this.interferences.push(interference)
            }

            const assignmentIdentifier = assignment.getLHSIdentifier()
            if (!this.branchAssignmentSets[currentBranch]) {
                this.branchAssignmentSets[currentBranch] = {};
            }
            this.branchAssignmentSets[currentBranch][assignmentIdentifier] = assignment;
        }
        this._removeAssignmentFromOtherBranches(assignment)
    }

    getInterferences() {
        return this.interferences
    }
}

module.exports = OverridingAssignmentService