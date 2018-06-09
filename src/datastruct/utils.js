import {Map, List} from 'immutable';

export function isImmutable(e){ return e instanceof Map || e instanceof List; };
