const Generator = require('yeoman-generator')
const path = require('path')
const { addDependencies, addPkgScript, writeKeyAppConfig } = require('../../lib/utils')

class FranklinGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts, undefined)
    this.props = {}
  }

  async prompting () {
    // Default tenant if we skip all prompts
    this.tenant = 'demo-site'
    if (!this.options['skip-prompt']) {
      const res = await this.prompt([
        {
          type: 'input',
          name: 'tenant',
          message: 'What is the name of the AEM tennant you would like to use?'
        }
      ])
      this.tenant = res.tenant
    }
  }

  writing () {
    this.sourceRoot(path.join(__dirname, 'templates'))

    this.fs.copyTpl(
      `${this.templatePath()}/**`,
      this.destinationPath(),
      this.props)

    addDependencies(this, { 'franklin-esr': 'adobe-rnd/franklin-esr' })
    addDependencies(this, { 'patch-package': '^6.4.7' }, true)
    addPkgScript(this, { build: 'franklin build', dev: 'franklin dev', postinstall: 'patch-package' })
    writeKeyAppConfig(this, 'franklin.tenant', this.tenant)
  }
}

module.exports = FranklinGenerator
