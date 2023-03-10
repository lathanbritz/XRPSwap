import Link from 'next/link'

import { LogoIcon } from '../Icon/Logo'

const Socials = () => {
  return (
    <div className='flex grid-flow-col gap-4 md:place-self-center md:justify-self-end'>
      <Link href='https://github.com/develoQ/XRPSwap' target='_blank'>
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' className='fill-current'>
          <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
        </svg>
      </Link>
    </div>
  )
}

const Footer = () => {
  return (
    <footer className='footer grid grid-cols-12 items-center justify-between gap-y-2 bg-base-200 p-4 pb-[calc(env(safe-area-inset-bottom)+6rem)] text-base-content md:flex md:px-12 md:pb-4'>
      <div className='col-span-12 flex w-full items-center justify-between'>
        <div className='flex items-center'>
          <LogoIcon className='h-12 w-12' />
          <span className='ml-1 text-2xl font-semibold'>XRPSwap</span>
          <p className='ml-4 hidden md:inline'>Copyright © 2023 XRPSwap - All right reserved</p>
        </div>
        <div className='block md:hidden'>
          <Socials />
        </div>
      </div>
      <div className='hidden md:block'>
        <Socials />
      </div>
      <div className='col-span-12 flex w-full justify-center md:hidden'>
        <p className='inline text-center md:hidden'>Copyright © 2023 XRPSwap - All right reserved</p>
      </div>
    </footer>
  )
}

export default Footer
