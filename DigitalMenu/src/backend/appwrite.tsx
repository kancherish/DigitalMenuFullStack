import { Client,Account,Databases, TablesDB } from "appwrite";
import { VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID} from "../env";

const client = new Client()
    .setEndpoint(VITE_APPWRITE_ENDPOINT)
    .setProject(VITE_APPWRITE_PROJECT_ID);
const account = new Account(client);
const databases = new Databases(client);


const tablesdb = new TablesDB(client);


export { client, account, databases,tablesdb };