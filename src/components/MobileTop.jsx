import React from 'react'
import { YouTubeLogo  } from "./youtube-logo";
import { Search , Bell } from 'lucide-react';
const MobileTop = () => {
  return (
    <div className='w-screen h-12 flex items-center justify-between  border p-4 '>
        <YouTubeLogo />
        <div className='flex items-center justify-between space-x-5'>
            <Bell/>
        <Search />
        </div>
    </div>
  )
}

export default MobileTop