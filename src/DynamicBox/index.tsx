import { styled } from '@linaria/react'
import styles from './DynamicBox.module.css';

const StyledDynamicBox = styled.div`
  background-color: red;
  width: 99px;
  height: 99px;
`;

const DynamicBox = () => {
  return (
    <StyledDynamicBox className={styles.theOne}>
      This is a dynamically loaded box component
    </StyledDynamicBox>
  )
}

export default DynamicBox;