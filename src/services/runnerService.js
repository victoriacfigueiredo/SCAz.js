const { spawnSync } = require('child_process')
const path = require('path')
const { BASE_DIR, AVAILABLE_ANALYSES_DIR } = require('./../../config')
const { listDirectoriesInBaseDir } = require('./../utils/file')
const { v4: uuidv4 } = require('uuid')
const Context = require('./../models/Context')
const { Event, EventTypeEnum } = require('./../models/Event')
const { EventService } = require('./eventService')
const Logger = require('./../utils/logger')

const logger = new Logger('Runner')


class AnalysisUnit {
  constructor(conflictAnalysis, inputPath, command, uuid) {
    this.conflictAnalysis= conflictAnalysis
    this.inputPath = inputPath
    this.command = command
    this.uuid = uuid
  }

  getUUID = () => this.uuid
}

class RunnerService {
  constructor () {
  }

  static getInstance () {
    if (!this.instance) {
      this.instance = new RunnerService()
    }
    return this.instance
  }

  buildAnalysisUnit = (conflictAnalysis, inputPath, lineToBranchMapPath) => {
    const chainedAnalysesPath = path.join(BASE_DIR, 'jalangi2', 'src', 'js', 'sample_analyses', 'ChainedAnalyses.js')
    const smemoryAnalysisPath = path.join(BASE_DIR, 'jalangi2', 'src', 'js', 'runtime', 'SMemory.js')
    const traceAllAnalysisPath = path.join(BASE_DIR, 'jalangi2', 'src', 'js', 'sample_analyses', 'pldi16', 'TraceAll.js') //--analysis ${traceAllAnalysisPath}
    const jalangiPath = path.join(BASE_DIR, 'jalangi2', 'src', 'js', 'commands', 'jalangi.js')
    const uuid = uuidv4()
    const extraParams = [
      ['lineToBranchMapPath', `${lineToBranchMapPath}`].join(','),
      ['UUID', `${uuid}`].join(','),
      ['inputFilePath', `${inputPath}`]
    ].join('%')
    
    Context.getInstance().setUUID(uuid)
    return new AnalysisUnit(
      conflictAnalysis,
      inputPath,
      `node ${jalangiPath} --initParam extraParams:${extraParams} --inlineIID --inlineSource --analysis ${chainedAnalysesPath} --analysis ${smemoryAnalysisPath} --analysis ${path.join(AVAILABLE_ANALYSES_DIR, conflictAnalysis, 'index.js')} ${inputPath}`,
      uuid
    )
  }
  
  runAnalysisUnit = analysisUnit => {
    logger.log(`\nRunning against: ${analysisUnit.inputPath}`);
    try {
      const result = spawnSync(analysisUnit.command.split(' ')[0], analysisUnit.command.split(' ').filter((_, i) => i !== 0), { encoding: 'utf-8', timeout: 120000 });
      if (result.status != null && result.status === 0 && result.stdout) {
        logger.log(`Output: ${result.stdout}`)
        const eventBatch = EventService.recoverBatchFromString(result.stdout)
        logger.log(`Output Event Batch: ${JSON.stringify(eventBatch)}`);
        return eventBatch
      } else {
        if (result.error) {
          throw error
        } else {
          throw new Error(result.stderr)
        }
      }
    } catch (error) {
      const eventBatch = EventService.buildBatch(
          Context.getInstance().getUUID(),
          {},
          [new Event(EventTypeEnum.ERROR, `Error`,`${error?.message}`)]
        )
        logger.log(`Error Event Batch: ${JSON.stringify(eventBatch)}`);
      return eventBatch
    }
    logger.log('Nothing happened')
    return EventService.buildBatch(
      Context.getInstance().getUUID(),
      {},
      []
    )
  }
  
  runAnalysis = (conflictAnalysis, inputPath, lineToBranchMapPath) => {
    logger.log(`\nStarting to run analysis: ${conflictAnalysis}...`)
    const analysisUnit = this.buildAnalysisUnit(conflictAnalysis, inputPath, lineToBranchMapPath)
    return this.runAnalysisUnit(analysisUnit)
  }
  
  getAvailableAnalyses = () => {
    return listDirectoriesInBaseDir(path.join(AVAILABLE_ANALYSES_DIR))
  }
  
  runAnalyses = (conflictAnalysisValue, inputPath, lineToBranchMapPath) => {
    switch (conflictAnalysisValue) {
      case undefined:
        const analyses = this.getAvailableAnalyses()
        for (let conflictAnalysis of analyses) {
          this.runAnalysis(conflictAnalysis, inputPath, lineToBranchMapPath)
        }
        break
      default:
        this.runAnalysis(conflictAnalysisValue, inputPath, lineToBranchMapPath)
        break
    }
  }
}

// const runner = new Runner()

// runner.runAnalyses('override_assignment', '.../src/analyses/override_assignment/test_cases/example/index.js', '.../src/analyses/override_assignment/test_cases/example/line_to_branch_map.json')

// Example command: node src/generic-runner.js --inputPath=.../src/analyses/override_assignment/test_cases/example/index.js --lineToBranchMapPath=.../src/analyses/override_assignment/test_cases/example/line_to_branch_map.json
// runner.runFromCLI()

module.exports = {
  RunnerService
}
