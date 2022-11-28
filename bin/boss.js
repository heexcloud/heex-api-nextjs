import { Command } from "commander";
import * as actions from "./actions.js";

const program = new Command();

program
  .name("Heex-Boss-Cli")
  .description("CLI to some Heex Boss utilities")
  .version("0.0.1");

program
  .command("signup")
  .description("Create a new boss (admin) for Heex Boss")
  .requiredOption("-u, --username <username>")
  .requiredOption("-e, --email <email>")
  .requiredOption("-p, --password <password>")
  .action(async (options, _program) => {
    await actions.signup(options);
  })
  .parse();
