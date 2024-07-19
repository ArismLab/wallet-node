import * as dotenv from 'dotenv'

const isProduction = process.env.NODE_ENV === 'production'
dotenv.config({ path: isProduction ? '.env' : '.env.local' })

const nodes = [
    {
        id: 1,
        url: 'https://average-leonora-snowyfield1906-afbf7760.koyeb.app/',
    },
    { id: 2, url: '' },
    { id: 3, url: '' },
]

const productionConfig = {
    url: nodes.find((node) => node.id === Number(process.env.NODE_ID)).url,
    port: process.env.PORT,
    database: {
        mongoUri: process.env.MONGO_URI,
    },
    privateKey: process.env.PRIVATE_KEY,
    nodes: nodes,
}

const localConfig = {
    url: nodes.find((node) => node.id === Number(process.env.NODE_ID)).url,
    port: 3000 + Number(process.env.NODE_ID),
    database: {
        mongoUri: `mongodb+srv://kiet1618:12052002@kltn.mbww3bu.mongodb.net/node${process.env.NODE_ID}?retryWrites=true&w=majority`,
    },
    privateKey: process.env[`NODE${process.env.NODE_ID}_PRIVATE_KEY`],
    nodes: nodes,
}

export default () => (isProduction ? productionConfig : localConfig)
