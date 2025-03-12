class Logger {
    constructor(context) {
        this.context = `[${context}] - `
    }

    log = (msg) => {
        //console.log(this.addContext(msg))
    }

    addContext = (msg) => {
        return `${this.context}${msg}`
    }
}

module.exports = Logger