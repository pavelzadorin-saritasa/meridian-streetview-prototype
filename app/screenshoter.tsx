'use client'

import { useState } from "react";
import { createHmac } from "crypto";
import { format, parse } from "url";

const imageHost = 'https://maps.googleapis.com';
const secret = '###';
const apiKey = '###';

function removeWebSafe(safeEncodedString: string) {
    return safeEncodedString.replace(/-/g, '+').replace(/_/g, '/');
}

function makeWebSafe(encodedString: string) {
    return encodedString.replace(/\+/g, '-').replace(/\//g, '_');
}

function decodeBase64Hash(code: string) {
    return Buffer.from(code, 'base64');
}

function encodeBase64Hash(key: Buffer, data: string) {
    return createHmac('sha1', key).update(data).digest('base64');
}

export default function Screenshoter({ pov, center, fov }: 
    { pov: google.maps.StreetViewPov, center: google.maps.LatLngLiteral, fov: number }
) {
    const [ img, setImg ] = useState<string | null>(null);
    
    function onClick() {
        let imgPath = `/maps/api/streetview?size=600x400&location=${center.lat},${center.lng}&fov=${fov}&heading=${pov.heading}&pitch=${pov.pitch}`;
        imgPath += `&key=${apiKey}`;

        const uri = parse(imgPath);

        if (uri.path) {
            const safeSecret = decodeBase64Hash(removeWebSafe(secret));
            const hashedSignature = makeWebSafe(encodeBase64Hash(safeSecret, uri.path));

            setImg(format(uri) + '&signature=' + hashedSignature);
        }
    }

    return (<div>
        <button onClick={onClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Take StreetView screenshot</button>
        {img && <img src={`${imageHost}${img}`} />}
    </div>);
}
