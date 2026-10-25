import {registerHooks,stripTypeScriptTypes} from "node:module";
import {readFileSync,existsSync} from "node:fs";
import {resolve,extname} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));
registerHooks({
 resolve(specifier,context,next){
  let path;
  if(specifier.startsWith("@/"))path=resolve(root,"src",specifier.slice(2));
  else if(specifier.startsWith(".")&&context.parentURL?.startsWith("file:"))path=fileURLToPath(new URL(specifier,context.parentURL));
  if(path){if(existsSync(path)&&extname(path))return next(pathToFileURL(path).href,context);for(const candidate of [path+".ts",path+"/index.ts"])if(existsSync(candidate))return next(pathToFileURL(candidate).href,context);}
  return next(specifier,context);
 },
 load(url,context,next){
  if(url.endsWith(".json"))return {format:"module",shortCircuit:true,source:"export default "+readFileSync(new URL(url),"utf8")+";"};
  if(url.endsWith(".ts"))return {format:"module",shortCircuit:true,source:stripTypeScriptTypes(readFileSync(new URL(url),"utf8"))};
  return next(url,context);
 }
});
