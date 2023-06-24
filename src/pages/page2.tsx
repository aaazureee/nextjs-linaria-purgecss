// import styles from '../styles/Page2.module.css'
import Link from 'next/link';
import { styled } from '@linaria/react'

const NotBox = styled.div`  
    width: 200px;
    height: 200px;
    background-color: skyblue;
`;


const Page2 = () => {
  return (
    <div>
      Hey
      <Link href={'/'} prefetch={false}>Something</Link>
      <NotBox />
    </div>
  )
}


export default Page2;   