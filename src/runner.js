const { exec, execSync } = require('child_process')
const path = require('path')
const { ALLOWED_CONFLICT_ANALYSES, BASE_DIR, AVAILABLE_ANALYSES_DIR } = require('./config')
const { listDirectoriesInBaseDir } = require('./utils/file')


class AnalysisUnit {
  constructor(conflictAnalysis, inputPath, command) {
    this.conflictAnalysis= conflictAnalysis
    this.inputPath = inputPath, 
    this.command = command
  }
}

class Runner {
  constructor () {
    this.inputPath = undefined // Default value for inputPath
    this.lineToBranchMapPath = undefined // Default value for lineToBranchMapPath
    this.conflictAnalysisValue = undefined // Default value for conflictAnalysis
  }

  runFromCLI = () => {
    // Process command-line arguments
    for (let i = 2; i < process.argv.length; i++) {
      const arg = process.argv[i]
      if (arg.startsWith('--inputPath=')) {
        // Extract the value following '--inputPath'
        this.inputPath = arg.substring('--inputPath='.length)
      } else if (arg.startsWith('--lineToBranchMapPath=')) {
        // Extract the value following '--lineToBranchMapPath'
        this.lineToBranchMapPath = arg.substring('--lineToBranchMapPath='.length)
      } else if (arg.startsWith('--conflictAnalysis=')) {
        // Extract the value following '--conflictAnalysis'
        const providedValue = arg.substring('--conflictAnalysis='.length)
        if (ALLOWED_CONFLICT_ANALYSES.includes(providedValue)) {
          this.conflictAnalysisValue = providedValue
        }
      }
    }
    if (!this.inputPath) {
      throw Error('Invalid inputPath value provided.')
    }
    if (!this.lineToBranchMapPath) {
      throw Error('Invalid lineToBranchMapPath value provided.')
    }
    if (!this.conflictAnalysisValue) {
      console.warn('Invalid or missing conflictAnalysis value provided. Running all analyses...')
    }

    console.log(`Input path value: ${this.inputPath}`)
    console.log(`Conflict analysis value: ${this.conflictAnalysisValue ?? 'all available'}`)
    this.runAnalyses(this.conflictAnalysisValue, this.inputPath, this.lineToBranchMapPath)
  
  }

  buildAnalysisUnit = (conflictAnalysis, inputPath, lineToBranchMapPath) => {
    const chainedAnalysesPath = path.join(BASE_DIR, 'jalangi2', 'src', 'js', 'sample_analyses', 'ChainedAnalyses.js')
    const smemoryAnalysisPath = path.join(BASE_DIR, 'jalangi2', 'src', 'js', 'runtime', 'SMemory.js')
    const jalangiPath = path.join(BASE_DIR, 'jalangi2', 'src', 'js', 'commands', 'jalangi.js')
    
    return new AnalysisUnit(
      conflictAnalysis,
      inputPath,
      `node ${jalangiPath} --initParam lineToBranchMapPath:${lineToBranchMapPath} --inlineIID --inlineSource --analysis ${chainedAnalysesPath} --analysis ${smemoryAnalysisPath} --analysis ${path.join(AVAILABLE_ANALYSES_DIR, conflictAnalysis, 'analysis.js')} ${inputPath}`
    )
  }
  
  runAnalysisUnit = analysisUnit => {
    console.log(`\nRunning against: ${analysisUnit.inputPath}`);
    try {
      const stdout = execSync(analysisUnit.command, { encoding: 'utf-8' });
      if (stdout) console.log(`Output: ${stdout}`);
      else console.log(`No output`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }
  
  runAnalysis = (conflictAnalysis, inputPath, lineToBranchMapPath) => {
    console.log(`\nSTARTING TO RUN ANALYSIS: ${conflictAnalysis}...`)
    this.runAnalysisUnit(this.buildAnalysisUnit(conflictAnalysis, inputPath, lineToBranchMapPath))
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
  Runner
}

