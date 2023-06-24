import { css } from '@linaria/core'
import { styled } from '@linaria/react'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Box2 } from '../styles'
import styles from '../styles/Home.module.css';
import dynamic from 'next/dynamic'

const DynamicBox = dynamic(() => import('../DynamicBox'), { ssr: false });

const Box = styled.div`
  margin-top: 40px;
  margin-left: 40px;
  height: 200px;
  width: 200px;
  background-color: tomato;
  animation: spin 2s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
`

const anotherClass = css`
  color: blue;
`

export default function Home() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('This is the one', count);
  }, [count]);

  // const { description: zzz } = styles;

  // const { anotherClass } = styles;
  // const { Box } = styles;

  return (
    <>
      <Head>
        <title>Create Next App</title>

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles['not-the-one']}>
        <div >This is home</div>
        <button onClick={() => setCount(c => c + 1)} className="anotherClass Box">Clcik</button>
        <Box className={anotherClass}>Zero runtime CSS in JS</Box>
        <Box2 />
        {count === 2 && <DynamicBox />}
      </main>
    </>
  )
}
