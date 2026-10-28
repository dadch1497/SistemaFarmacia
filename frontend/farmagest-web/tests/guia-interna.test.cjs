const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const ts=require('typescript');const {of,firstValueFrom}=require('rxjs');
const source=fs.readFileSync(path.join(__dirname,'../src/app/core/services/guia-interna.service.ts'),'utf8').replace(/^import[\s\S]*?;\r?\n/gm,'');
const context={exports:{},require,File,Blob,firstValueFrom,Injectable:()=>t=>t};
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,experimentalDecorators:true}}).outputText,context);
const Service=context.exports.GuiaInternaService;
const producto={id:155,nombre:'Producto de prueba',codigoBarras:'0012345678905',presentacion:'Unidad'};
const orden={id:7,numeroOrden:'OC-7',estado:'APROBADA',fechaEmision:'2026-10-27',sucursalId:1,proveedor:{razonSocial:'Proveedor prueba',ruc:'NO REGISTRADO'},subtotal:16,igv:2.88,total:18.88,detalles:[{productoId:155,cantidadSolicitada:2,costoPactado:8}]};
test('pending and cancelled purchases cannot produce an expected-receipt guide',()=>{
 const service=new Service({},{});for(const estado of ['PENDIENTE','CANCELADA'])assert.throws(()=>service.datosOrden({...orden,estado},[producto]),/apruebe/);
});
test('approved guide uses exact saved quantities and leaves physical reception fields blank',()=>{
 const service=new Service({},{});const data=service.datosOrden(orden,[producto]);assert.equal(data.codigo,'GI-OC-7');assert.equal(data.filas[0].cantidad,2);assert.equal(data.filas[0].costo,8);assert.equal(data.filas[0].lote,'');assert.equal(data.filas[0].vencimiento,'');assert.equal(data.filas[0].codigo,'0012345678905');assert.equal(data.total,18.88);
});
test('historical receipt without purchase uses actual batch and quantity without inventing supplier',()=>{
 const service=new Service({},{});const data=service.datosIngreso({id:9,numeroGuia:'GR-REAL',sucursalId:1,fechaRecepcion:'2026-10-27',detalles:[{productoId:155,cantidadRecibida:3,costoUnitarioReal:8,numeroLote:'LOTE-REAL',fechaVencimiento:'2028-01-01'}]},[producto]);assert.equal(data.modo,'RECIBIDA');assert.equal(data.filas[0].lote,'LOTE-REAL');assert.equal(data.total,24);assert.match(data.proveedor,/Sin compra asociada/);
});
test('guide fetches product identity outside first catalog page and never writes a purchase or stock',async()=>{
 let productId;const service=new Service({obtenerOrden:()=>of(orden)},{obtenerProductoPorId:id=>{productId=id;return of(producto);}});service.generar=async data=>data;const doc=await service.obtener(7,null);assert.equal(productId,155);assert.equal(doc.filas[0].producto,'Producto de prueba');
});
test('missing catalog product cannot silently become an unrelated first product',()=>{
 const service=new Service({},{});assert.throws(()=>service.datosOrden(orden,[{...producto,id:1}]),/ficha/);
});
test('generates a valid PDF with internal identification, quantities and source product',async()=>{
 const service=new Service({},{});const file=await service.generar(service.datosOrden(orden,[producto]));assert.equal(file.name,'GI-OC-7.pdf');assert.equal(file.type,'application/pdf');const bytes=new Uint8Array(await file.arrayBuffer());assert.equal(Buffer.from(bytes.slice(0,5)).toString(),'%PDF-');
 const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');const task=pdfjs.getDocument({data:bytes,standardFontDataUrl:path.resolve(__dirname,'../node_modules/pdfjs-dist/standard_fonts').replaceAll('\\','/')+'/'});const pdf=await task.promise;try{const content=await(await pdf.getPage(1)).getTextContent();const text=content.items.map(i=>i.str||'').join(' ');assert.match(text,/GUÍA INTERNA/);assert.match(text,/GI-OC-7/);assert.match(text,/Producto de prueba/);assert.match(text,/NO ES GUÍA SUNAT/);assert.match(text,/Recibido/);}finally{await task.destroy();}
});
