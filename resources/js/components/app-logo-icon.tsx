import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
       <img className='h-4xl w-4xl'  src="/favicon.png" alt="logo" />
    );
}
