import * as dotenv from 'dotenv'

const isLocal = process.env.NODE_ENV === 'local'
dotenv.config({ path: isLocal ? '.env.local' : '.env' })

const nodes = [
    {
        id: 1,
        url: 'https://node1-arismlab.koyeb.app/',
    },
    { id: 2, url: 'https://node2-arismlab.koyeb.app/' },
    { id: 3, url: 'https://node3-arismlab.koyeb.app/' },
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
    url: `http://127.0.0.1:300${process.env.NODE_ID}`,
    port: 3000 + Number(process.env.NODE_ID),
    database: {
        mongoUri: `mongodb+srv://kiet1618:12052002@kltn.mbww3bu.mongodb.net/node${process.env.NODE_ID}?retryWrites=true&w=majority`,
    },
    privateKey: process.env[`NODE${process.env.NODE_ID}_PRIVATE_KEY`],
    nodes: nodes,
}

export default () => (isLocal ? localConfig : productionConfig)
