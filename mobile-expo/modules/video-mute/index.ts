import {requireOptionalNativeModule} from 'expo';
const module=requireOptionalNativeModule<{stripAudio(uri:string):Promise<string>}>('VideoMute');
export async function stripAudio(uri:string):Promise<string>{if(!module)throw new Error('Video processing requires the native development build.');return module.stripAudio(uri);}