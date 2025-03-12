const { RunnerService } = require('../../../src/services/runnerService')
const { AVAILABLE_ANALYSES_DIR } = require('../../../config')
const { EventTypeEnum } = require('../../../src/models/Event')
const Context = require('../../../src/models/Context')
const AnalysisEnum = require('../../../src/models/AnalysisEnum')

const ANALYSIS = AnalysisEnum.DATA_FLOW
const ANALYSIS_PATH = `${AVAILABLE_ANALYSES_DIR}/${ANALYSIS}`

const runner = new RunnerService();


describe('Overriding Assignment Analysis Test Cases', () => {
    test.each([
        // { testCase: 'example', conflict: true },
        // { testCase: 'innerClassRecursiveNotConflictSample', conflict: true }, // ERRO
        { testCase: 'additionToArrayConflictSample', conflict: true }, // divergent => change name
        { testCase: 'arrayDataFlowSample', conflict: true },
        { testCase: 'function', conflict: true},
        { testCase: 'indirect', conflict: true}
    ])('$testCase, conflict: $conflict', ({ testCase, conflict: hasEvent }) => {
        const result = runner.runAnalysisRaw(
            `${ANALYSIS_PATH}/test_cases/${testCase}/index.js`,
            `${ANALYSIS_PATH}/index.js`,
            `${ANALYSIS_PATH}/test_cases/${testCase}/line_to_branch_map.json`,
        );
        expect((result || '').includes('[DF Detected]')).toBe(hasEvent)  
    })
})
