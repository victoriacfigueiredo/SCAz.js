const {RunnerService} = require('../services/runnerService');

const runner = new RunnerService();

// runner.runAnalysisRaw(
//     '/home/vic/SCAz.js/src/analyses/overriding_assignment/test_cases/additionToArrayConflictSample/index.js',
//     '/home/vic/SCAz.js/src/analyses/data_flow/index.js',
//     '/home/vic/SCAz.js/src/analyses/overriding_assignment/test_cases/additionToArrayConflictSample/line_to_branch_map.json',
// );

runner.runAnalysisRaw(
    '/home/vic/SCAz.js/src/analyses/data_flow/test_cases/arrawDataFlowSample/index.js',
    '/home/vic/SCAz.js/src/analyses/data_flow/index.js',
    '/home/vic/SCAz.js/src/analyses/data_flow/test_cases/arrawDataFlowSample/line_to_branch_map.json',
);
