import {TinySeq, isSeq, ORM} from '../../../';
import {Entity} from '../../orm';

const hasOwn = Object.prototype.hasOwnProperty

function getVersionRec(obj){
    if(typeof obj !== 'object' || obj === null)
        return -Infinity;
    if(obj instanceof Entity){
        return obj._version;
    }
    let ret = -Infinity;
    if(isSeq(obj)){
        obj = obj.toRaw();
        if(Array.isArray(obj)){
            for(let i = 0; i < obj.length; ++i){
                let v = getVersionRec(obj[i]);
                if(v > ret)
                    ret = v;
            }
        }else{
            for(let k in obj){
                let v = getVersionRec(obj[k]);
                if(v > ret)
                    ret = v;
            }
        }
    }
    return ret;
}

export default function getVersion(obj){
    //wrapping into TinySeq we would get iterated over the object
    return getVersionRec(TinySeq(obj));
}