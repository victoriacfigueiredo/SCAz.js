const { RunnerService } = require('../../../src/services/runnerService')
const { AVAILABLE_ANALYSES_DIR } = require('../../../config')
const { EventTypeEnum } = require('../../../src/models/Event')
const Context = require('../../../src/models/Context')
const AnalysisEnum = require('../../../src/models/AnalysisEnum')

const ANALYSIS = AnalysisEnum.OVERRIDING_ASSIGNMENT
const ANALYSIS_PATH = `${AVAILABLE_ANALYSES_DIR}/${ANALYSIS}`

const runner = new RunnerService();


describe('Overriding Assignment Analysis Test Cases', () => {
    test.each([
        // { testCase: 'example', conflict: true },
        // { testCase: 'innerClassRecursiveNotConflictSample', conflict: true }, // ERRO
        { testCase: 'additionToArrayConflictSample', conflict: true }, // divergent => change name
        { testCase: 'arrawDataFlowSample', conflict: true }
    ])('$testCase, conflict: $conflict', ({ testCase, conflict: hasEvent }) => {
        const result = runner.runAnalysisRaw(
            `/home/vic/SCAz.js/src/analyses/data_flow/test_cases/${testCase}/index.js`,
            '/home/vic/SCAz.js/src/analyses/data_flow/index.js',
            `/home/vic/SCAz.js/src/analyses/data_flow/test_cases/${testCase}/line_to_branch_map.json`,
        );      
        expect(result.includes('[DF Detected]')).toBe(hasEvent)  
    })
})
