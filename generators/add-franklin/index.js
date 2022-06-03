const Generator = require('yeoman-generator')
const path = require('path')
const { addDependencies, addPkgScript, writeKeyAppConfig } = require('../../lib/utils')
const { isLoopingPrompts } = require('../../lib/constants')

class FranklinGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts, undefined)
    this.props = {}

    this.option('add-actions', { type: Boolean, default: false })
  }

  async prompting () {
    // Default tenant if we skip all prompts
    this.tenant = 'demo-site'
    this.coreComponents = []
    if (!this.options['skip-prompt']) {
      const res = await this.prompt([
        {
          type: 'input',
          name: 'tenant',
          message: 'What is the name of the AEM tenant you would like to use?',
          loop: isLoopingPrompts
        },
        {
          type: 'checkbox',
          name: 'coreComponents',
          message: 'Which AEM Core Components should we generate stubs to customise for?',
          loop: isLoopingPrompts,
          choices: [
            {
              name: 'Teaser',
              value: 'teaser',
              checked: false
            },
            {
              name: 'Title',
              value: 'title',
              checked: false
            },
            {
              name: 'Text',
              value: 'text',
              checked: false
            },
            {
              name: 'Container',
              value: 'container',
              checked: false
            },
            {
              name: 'Separator',
              value: 'separator',
              checked: false
            }
          ]
        }
      ])
      this.tenant = res.tenant
      this.coreComponents = res.coreComponents
    }
  }

  writing () {
    this.sourceRoot(path.join(__dirname, 'templates'))

    this.fs.copyTpl(
      `${this.templatePath()}/**`,
      this.destinationPath(),
      this.props,
      undefined, { globOptions: { ignore: ['**/template-core-component/**', '**/actions/**'] } })

    // If actions folder is being generated, add package.json to make type commonjs
    if (this.options['add-actions']) {
      this.fs.copy(this.templatePath('actions/package.json'), this.destinationPath('actions/package.json'))
    }

    addDependencies(this, { 'franklin-esr': 'adobe-rnd/franklin-esr' })
    addDependencies(this, { 'patch-package': '^6.4.7' }, true)
    addPkgScript(this, { build: 'franklin build', dev: 'franklin dev', postinstall: 'patch-package' })
    writeKeyAppConfig(this, 'franklin.tenant', this.tenant)

    this.coreComponents.forEach((component) => {
      this.fs.copyTpl(
        this.templatePath('components/template-core-component/index.jsx'),
        this.destinationPath(`components/${component}/index.jsx`),
        { componentName: component }
      )
    })
  }
}

module.exports = FranklinGenerator
