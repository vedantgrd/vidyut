import{SignJWT,jwtVerify}from'jose'
export interface AccessTokenPayload{userId:string;role:string}
const as2=()=>{const s=process.env.JWT_ACCESS_SECRET;if(!s)throw new Error('JWT_ACCESS_SECRET missing');return new TextEncoder().encode(s)}
const rs2=()=>{const s=process.env.JWT_REFRESH_SECRET;if(!s)throw new Error('JWT_REFRESH_SECRET missing');return new TextEncoder().encode(s)}
export async function signAccessToken(p:AccessTokenPayload):Promise<string>{return new SignJWT({...p}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime(process.env.JWT_ACCESS_EXPIRY??'15m').sign(as2())}
export async function verifyAccessToken(t:string):Promise<AccessTokenPayload>{const{payload}=await jwtVerify(t,as2());return payload as unknown as AccessTokenPayload}
export async function signRefreshToken(userId:string):Promise<string>{return new SignJWT({userId}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime(process.env.JWT_REFRESH_EXPIRY??'7d').sign(rs2())}
export async function verifyRefreshToken(t:string):Promise<{userId:string}>{const{payload}=await jwtVerify(t,rs2());return payload as unknown as{userId:string}}
