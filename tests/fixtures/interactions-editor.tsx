import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {StepForm} from '../../src/features/interactions/components/StepForm';
import {StepList} from '../../src/features/interactions/components/StepList';
import type {Step} from '../../src/features/interactions/schema';
import '../../src/app/globals.css';
function App(){
 const [steps,setSteps]=useState<Step[]>([{scroll:'target',smooth:true},{call:'api',method:'GET',url:'/test'}]);
 const [list,setList]=useState<Step[]>([{toast:'First'}, {toast:'Second'}]);
 (window as any).list=list;
 (window as any).steps=steps;
 const ctx={variables:[],stepIds:[],elements:[{id:'target',name:'Target'}]};
 return <main style={{width:280}}><StepForm step={steps[0]} onChange={s=>setSteps([s,steps[1]])} issues={[]} stepPath="interactions.ix_aaaaaaaa.do[0]" suggestCtx={ctx} variables={[]} flows={[]} /><StepForm step={steps[1]} onChange={s=>setSteps([steps[0],s])} issues={[]} stepPath="interactions.ix_aaaaaaaa.do[1]" suggestCtx={ctx} variables={[]} flows={[]} /><StepList listPath={[]} steps={list} shared={{ixId:'ix_bbbbbbbb',root:list,onRootChange:setList,issues:[],nameOf:id=>id,elements:ctx.elements,variables:[],flows:[],verbs:['toast','if']}} /></main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
