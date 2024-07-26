import { Knex as KnexType } from "knex";
import { FileDeployer } from "../utils/deploy";

/**
 * Use this file to organize the deployment of each stored_procedure
 * in order
 */
export async function deploy(knex: KnexType, options: {
    verbose?: boolean
}) {
    const deployer = new FileDeployer(__dirname, {
        extensions: ['.sql'],
        knex,
        verbose: options.verbose,
    })
    
    // Start ordered deployments as needed
    await deployer.deploy('proc_a.sql')
    await deployer.deploy('proc_b.sql')

    // All the other files that don't have consequence to their deployment
    await deployer.finish()
}
