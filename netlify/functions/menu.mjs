import { getStore } from '@netlify/blobs';
import worker from '../../lib/menu-core.mjs';
export function createEnvironment(store,uploads,password){return {ADMIN_PASSWORD:password,MENU_DB:{prepare(){return{bind(...args){return{async first(){const value=await store.get(args[0]);return value===null?null:{value};},async run(){await store.set(args[0],args[1]);}};}};}},MENU_IMAGES:{async put(key,bytes,options){await uploads.set(key,bytes,{metadata:options.httpMetadata});},async get(key){const entry=await uploads.getWithMetadata(key,{type:'arrayBuffer'});return entry?{body:entry.data,httpMetadata:entry.metadata}:null;}}};}
export default async function(request){const store=getStore({name:'escalia-menu',consistency:'strong'});const uploads=getStore({name:'escalia-images',consistency:'strong'});return worker.fetch(request,createEnvironment(store,uploads,process.env.ADMIN_PASSWORD));}
export const config={path:['/api/*','/images/*'],preferStatic:true};
