'use client'
import React from 'react'
import { Playground } from '@/components/canvas/Playground'
import { Header } from '@/components/canvas/Header'
import { SidebarLeft } from '@/components/canvas/SidebarLeft'
import { SidebarRight } from '@/components/canvas/SidebarRight'

function page() {
    return (
        <div className="flex flex-col w-full">
            <Header />
            <div className="flex w-full">
                <SidebarLeft />
                <Playground />
                <SidebarRight />
            </div>
        </div>
    )
}

export default page