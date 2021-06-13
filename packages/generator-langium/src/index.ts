import Generator      from 'yeoman-generator';
import *         as _ from 'lodash';

// FIX: get during running: "No change to package.json was detected. No package manager install will be executed."

const TEMPLATE_DIR   = 'langium-template';
const USER_DIR       = 'app';

const OPEN           = '<%= ';
const CLOSE          = ' %>';

const EXTENSION_NAME = 'extension-name';
const LANGUAGE_NAME  = 'LanguageName';
const FILE_EXTENSION = 'file-extension';
const LANGUAGE_ID    = 'language-id';

class LangiumGenerator extends Generator
{
    // FIX: type of answers
    private answers: any;

    constructor(args: string | string[], options: Generator.GeneratorOptions) {
        super(args, options);
    }

    async prompting(): Promise<void> {
        this.answers = await this.prompt([ 
          {
            type: "input",
            name: "extensionName",
            message: "Your extension name",
            default: EXTENSION_NAME
          },
          {
            type: "input",
            name: "languageName",
            message: "Name of your language",
            default: LANGUAGE_NAME,
            validate: (input: string): boolean | string =>
              /^[a-zA-Z_][\w_ -]*$/.test(input) ? true : "You entered not correct language name. Try again."
          },
          {
            type: "input",
            name: "fileExtension",
            message: "File extension of your language",
            default: FILE_EXTENSION,
            validate: (input: string): boolean | string =>
                (/^[a-z]*$/.test(input.toString())) ? true : "Extension can contain only small letters. Try again."
          }
        ]);
    }

    writing(): void {
        this.answers.languageName = _.upperFirst(_.camelCase(this.answers.languageName
          .replace(/[ -]+/g, '_')));
        this.answers.languageId = _.snakeCase(this.answers.languageName);
  
        this.sourceRoot(TEMPLATE_DIR);
        [".", ".vscode", ".eslintrc.json", ".vscodeignore"].map(path => {
          const replaceTemplateWords = function(answers: any, content: Buffer): string {
            // FIX: regex can be replaced on parsers, but for what?
            const replaceMap = [ [EXTENSION_NAME, answers.extensionName]
                               , [FILE_EXTENSION, answers.fileExtension]
                               , [LANGUAGE_ID, answers.languageId]
                               , [LANGUAGE_NAME, answers.languageName]];
            return replaceMap.reduce(
                (acc: string, [templateWord, userAnswer]) => acc.replace(new RegExp(`${OPEN}${templateWord}${CLOSE}`, 'g'), userAnswer)
              , content.toString());
          }

          const replaceTemplateNames = function(answers: any, path: string): string {
            return path
              .replace(new RegExp(LANGUAGE_ID, 'g'), answers.languageId);
          }

          this.fs.copy(
            this.templatePath(path),
            this.destinationPath(USER_DIR, this.answers.extensionName, path),
            { process: (content: Buffer) => replaceTemplateWords(this.answers, content),
              processDestinationPath: (path: string) => replaceTemplateNames(this.answers, path) }
          );
        });
    }

    end(): void {
        this.log("Extension name:", this.answers.extensionName);
        this.log("Language name:", this.answers.languageName);
        this.log("Language identifier:", this.answers.languageId);
        this.log("File extension:", this.answers.fileExtension);
        this.log("Have a nice coding :)");
    }
}

export = LangiumGenerator;
