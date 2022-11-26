const { Command } = require("commander");
const argon2 = require("argon2");
const { signup } = require("./utils");

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
    await signup(options);
  })
  .parse();
