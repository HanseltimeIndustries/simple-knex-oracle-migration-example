import { Knex as KnexType } from "knex";
import { FileDeployer } from "../utils/deploy";
import { Envs, LOCAL_ENVS } from "../knexfile";

/**
 * Use this file to organize the deployment of each stored_procedure
 * in order
 */
export async function deploy(knex: KnexType, options: {
    verbose?: boolean,
    env: Envs,
}) {
    const deployer = new FileDeployer(__dirname, {
        extensions: ['.sql'],
        knex,
        verbose: options.verbose,
        env: options.env,
    })

    // Deploy some utilities for troubleshooting directories
    await deployer.deploy('custom_types/str_array.sql')
    await deployer.deploy('compiled_java/FileListHandler.sql', {
        onlyForEnvs: LOCAL_ENVS,
    })
    await deployer.deploy('functions/split_str.sql')
    await deployer.deploy('functions/get_dir_path.sql')
    await deployer.deploy('packages/file_list_api.sql', {
        onlyForEnvs: LOCAL_ENVS,
    })
    await deployer.deploy('functions/list_directory_files.sql', {
        onlyForEnvs: LOCAL_ENVS,
    })
    
    // Start ordered deployments as needed
    await deployer.deploy('stored_procedures/proc_a.sql')
    await deployer.deploy('stored_procedures/proc_b.sql')

    // All the other files that don't have consequence to their deployment
    await deployer.finish()
}
