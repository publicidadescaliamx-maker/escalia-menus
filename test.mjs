import fs from 'node:fs';import assert from 'node:assert/strict';import worker from './lib/menu-core.mjs';import {createEnvironment} from './netlify/functions/menu.mjs';
function mockStore(){const data=new Map();return {async get(key){return data.get(key)?.data??null},async set(key,value,options){data.set(key,{data:value,metadata:options?.metadata||{}})},async getWithMetadata(key){return data.get(key)||null}};}
const env=createEnvironment(mockStore(),mockStore(),'test-only');const origin='https://example.netlify.app';
const menu=await(await worker.fetch(new Request(origin+'/api/menu'),env)).json();assert.equal(menu.productos.length,8);assert(menu.negocio.logo.startsWith('/images/'));assert(menu.negocio.portada.startsWith('/images/'));
const request=(password,body)=>new Request(origin+'/api/menu',{method:'PUT',headers:{'Content-Type':'application/json','X-Admin-Password':password},body:JSON.stringify(body)});
assert.equal((await worker.fetch(request('invalid',menu),env)).status,401);menu.productos[0].precio+=1;assert.equal((await worker.fetch(request('test-only',menu),env)).status,200);const saved=await(await worker.fetch(new Request(origin+'/api/menu'),env)).json();assert.equal(saved.productos[0].precio,menu.productos[0].precio);
for(const path of ['/','/modificar/','/menu-data.js'])assert.equal((await worker.fetch(new Request(origin+path),env)).status,200);
for(const path of [saved.negocio.logo,saved.negocio.portada])assert(fs.statSync('public'+path).size>0);
console.log('Netlify storage adapter, authorized edit/read, routes and copied branding verified.');
