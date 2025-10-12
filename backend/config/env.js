import {config} from "dotenv";

config({path : ".env"});

export const{PORT,JWT_SECRET,JWT_EXPIRES_IN,RPC_URL,CONTRACT_ADDRESS}=process.env;