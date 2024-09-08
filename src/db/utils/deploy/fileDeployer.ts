import { lstatSync, readdirSync } from "fs";
import { Knex as KnexType } from "knex";
import { deployDataObject } from "./deployDataObject";
import { extname, join } from "path";

/**
 * This class will take all sql files of a given set of extensions
 * and will then:
 * 
 * 1. Allow you to explicitly call those files in time for a deployment
 * 2. Deploy all other files in parallel via finish()
 * 
 * IMPORTANT:  Please keep in mind that by not having explicit calls throughout
 * you may open yourself up to race conditions on deployment if something in 
 * finish() gets deployed once in the correct race condition.
 * 
 * Example Usage:
 * 
 * const deployer = newFileDeployer(resolve('path', 'to', 'my-stored-procedures'))
 * 
 * await deployer.deploy('foundation.sql')
 * await deployer.deploy('folderA/foundation2.sql')
 * await deployer.deploy('dependsOn2Foundations.sql')
 * 
 * // The other files that have no dependency will get deployed here
 * await deployer.finish()
 */
export class FileDeployer {
    private deploys = new Map<string, boolean>()
    readonly dir: string
    private finished: boolean = false
    private knex: KnexType
    readonly verbose: boolean
    readonly env: string

    constructor(dir: string, options:  {
        extensions: string[]
        knex: KnexType
        verbose?: boolean
        env: string
    }) {
        getFilesRecursive(dir, new Set(options.extensions)).forEach((f) => {
            this.deploys.set(f, false)
        })
        this.dir = dir
        this.knex = options.knex
        this.verbose = !!options.verbose
        this.env = options.env
    }

    async deploy(file: string, options?: {
        onlyForEnvs: string[]
    }) {
        if (this.deploys.get(file)) {
            throw new Error(`Already deployed ${file}!`)
        }
        if (!options?.onlyForEnvs || options.onlyForEnvs.includes(this.env)) {
            if (this.verbose) {
                console.log(`Deploying ${file}`)
            }
            await deployDataObject(this.knex, join(this.dir, file))
            if (this.verbose) {
                console.log(`Finished Deploying ${file}`)
            }
        } else {
            console.log(`Skipping ${file}`)
        }
        this.deploys.set(file, true)
    }

    async finish() {
        if (this.finished) {
            throw new Error('Cannot call finished on already finished FileDeployer')
        }
        await Promise.all(Array.from(this.deploys.entries()).map(async ([file, deployed]) => {
            if (!deployed) {
                await this.deploy(file)
            }
        }))
        this.finished = true
    }

}

function getFilesRecursive(dir: string, onlyExts: Set<string>, pathPrefix = '', paths = [] as string[]) {
    readdirSync(dir).forEach((path) => {
        const stat = lstatSync(join(dir, path))

        const rootDirPath = join(pathPrefix, path)

        if (stat.isDirectory()) {
            getFilesRecursive(join(dir, path), onlyExts, rootDirPath, paths)
        } else {
            if (!onlyExts.has(extname(path))) {
                return
            }
            paths.push(rootDirPath)
        }
    })
    return paths
}