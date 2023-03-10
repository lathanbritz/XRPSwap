import { useContext } from 'react'

import { AuthContext } from '@/app/context/authContext'

export const AccountInfo = () => {
  const { state, disconnect, runtime } = useContext(AuthContext)
  return (
    <ul className='menu rounded-box menu-horizontal bg-base-100 px-1 shadow'>
      <li tabIndex={0} className=''>
        <a>
          <p className='w-20 truncate'>{state?.account || state?.account}</p>
          <svg className='fill-current' xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'>
            <path d='M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z' />
          </svg>
        </a>
        <ul className='rounded-box bg-base-100 shadow'>
          <li>
            <a onClick={disconnect}>{runtime.xapp ? 'Close' : 'Disconnect'}</a>
          </li>
        </ul>
      </li>
    </ul>
  )
}
