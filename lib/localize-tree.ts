import {Children,cloneElement,isValidElement,type ReactNode} from 'react';
import {translate,type Locale} from './i18n.ts';

// A presentation-only boundary. It never changes callbacks, refs, form values,
// component data props, or game state. Components that generate their own text
// (currently RuneCoach) apply the same boundary inside their render function.
export function localizeTree(node:ReactNode,locale:Locale):ReactNode{
 if(locale==='en')return node;
 return Children.map(node,child=>{
  if(typeof child==='string')return translate(child,locale);
  if(!isValidElement<Record<string,unknown>>(child))return child;
  const props:Record<string,unknown>={};
  for(const key of ['aria-label','title','placeholder'])if(typeof child.props[key]==='string')props[key]=translate(child.props[key] as string,locale);
  if(child.props.children!==undefined)props.children=localizeTree(child.props.children as ReactNode,locale);
  return cloneElement(child,props);
 });
}
