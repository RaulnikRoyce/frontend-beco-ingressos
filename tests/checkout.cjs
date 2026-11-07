const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const assert=require('node:assert/strict');const {createRequire}=require('node:module');
const root=path.resolve(__dirname,'..');const req=createRequire(path.join(root,'package.json'));const vue=req('vue');const {renderToString}=req('@vue/server-renderer');
const source=fs.readFileSync(path.join(root,'src/pages/Evento.vue'),'utf8');const script=source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
async function harness({initialFail=false}={}){
 let mounted,unmounted;let timers=[];let requests=[];let created=[];let sequence=0;
 const scope=vue.effectScope();
 const context={computed:vue.computed,reactive:vue.reactive,ref:vue.ref,watch:vue.watch,onMounted:cb=>mounted=cb,onBeforeUnmount:cb=>unmounted=cb,
  useRoute:()=>({params:{slug:'evento-audit'},query:{}}),useRouter:()=>({replace(){},push(){}}),
  obterEvento:async()=>({id:1,slug:'evento-audit',nome:'<strong>Ana</strong>',data:'2099-01-01',local:'Local ficticio',lote_vigente:{id:1,nome:'Lote',preco:50,restam:10}}),
  previsualizarPedido:payload=>{if(sequence++===0)return initialFail?Promise.reject(Error('offline')):Promise.resolve({subtotal:50,desconto:0,taxa:0,repassa_taxa_comprador:false,total:50});let resolve;const promise=new Promise(r=>resolve=r);requests.push({payload,resolve});return promise;},
  criarPedido:async payload=>{created.push(payload);return {codigo:'ficticio'};},inscreverListaEspera:async()=>{},formatarData:v=>v,formatarMoeda:v=>Number(v||0).toFixed(2),atualizarOg(){},schemaEvento(){},mensagemDeErro:()=>'',LOJA_URL:'http://127.0.0.1',
  setTimeout:cb=>{const timer={cb};timers.push(timer);return timer;},clearTimeout:timer=>{timers=timers.filter(t=>t!==timer);},window:{location:{href:''}},alert(){},};
 const code=script.replace(/^import .*;\s*$/gm,'').replace('export default','globalThis.component =');vm.runInNewContext(code,context,{filename:'Evento.vue'});
 const state=scope.run(()=>context.component.setup());await mounted();
 return {state,created,requests,scope,dispose:()=>{unmounted();scope.stop();},fire:async()=>{await vue.nextTick();assert.ok(timers.length);return timers.pop().cb();},context};
}
async function main(){const results=[];let evidence;
 async function test(name,fn){try{evidence=undefined;await fn();results.push({name,pass:true,evidence});}catch(e){results.push({name,pass:false,error:String(e),evidence});}}
 await test('B-04: resposta de precificacao antiga nao pode substituir a quantidade atual',async()=>{
  const h=await harness();try{
   h.state.form.quantidade=2;const two=h.fire();await vue.nextTick();await new Promise(r=>setImmediate(r));
   h.state.form.quantidade=3;const three=h.fire();await vue.nextTick();await new Promise(r=>setImmediate(r));
   assert.equal(h.requests.length,2);
   const result=total=>({subtotal:total,desconto:0,taxa:0,repassa_taxa_comprador:false,total});
   h.requests[1].resolve(result(150));await three;h.requests[0].resolve(result(100));await two;
   evidence={quantidade:h.state.form.quantidade,total:h.state.precificacao.total};assert.equal(h.state.precificacao.total,150);
  }finally{h.scope.stop();}
 });
 await test('B-04b: erro na primeira precificacao nao deve permitir compra com total desconhecido',async()=>{
  const h=await harness({initialFail:true});try{h.state.form.lgpd=true;h.state.form.nome='Comprador ficticio';h.state.form.email='teste@teste.local';await h.state.comprar();evidence={total:h.state.precificacao.total,erro:h.state.erro.value,comprasIniciadas:h.created.length};assert.equal(h.created.length,0);}finally{h.scope.stop();}
 });
 await test('controle: texto com marcacao permanece texto ao renderizar o template real',async()=>{
  const h=await harness();try{const template=source.match(/<template>([\s\S]*?)<\/template>/)[1];const render=vue.compile(template);const html=await renderToString(vue.createSSRApp({setup:()=>h.state,render}));assert.ok(html.includes('&lt;strong&gt;Ana&lt;/strong&gt;'));assert.ok(!html.includes('<strong>Ana</strong>'));evidence={escaped:true};}finally{h.scope.stop();}
 });
 await test('compra valida funciona e edicao imediata invalida a cotacao antes do watcher',async()=>{
  const h=await harness();try{h.state.form.lgpd=true;await h.state.comprar();assert.equal(h.created.length,1);h.state.form.quantidade=2;await h.state.comprar();assert.equal(h.created.length,1);}finally{h.scope.stop();}
 });
 await test('cotacao pode ser repetida apos falha inicial',async()=>{
  const h=await harness({initialFail:true});try{const retry=h.state.atualizarPrecificacao();assert.equal(h.requests.length,1);h.requests[0].resolve({subtotal:50,desconto:0,taxa:0,total:50});await retry;h.state.form.lgpd=true;await h.state.comprar();assert.equal(h.created.length,1);}finally{h.scope.stop();}
 });
 await test('desmontagem descarta resposta pendente sem revalidar compra',async()=>{
  const h=await harness();h.state.form.quantidade=2;const pending=h.fire();await vue.nextTick();await new Promise(r=>setImmediate(r));assert.equal(h.requests.length,1);h.dispose();h.requests[0].resolve({subtotal:100,desconto:0,taxa:0,total:100});await pending;assert.equal(h.state.cotacaoValida.value,false);assert.equal(h.state.precificacao.total,50);
 });
 console.log(results);if(results.some(x=>!x.pass))process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=2});
