module.exports = {
    require: ['chai', 'ts-node/register'],
    extensions: ["ts"],
    spec: ["test/*.ts"],
    ui: 'bdd',
    // ui: 'tdd',

    reporter: 'spec', // default
    // reporter: 'nyan',
    // reporter: 'tap',
    // reporter: 'landing',
    // reporter: 'list'
    // reporter: 'progress',
    // reporter: 'min', // clears the terminal
    // reporter: 'dot',

    growl: false,
};
