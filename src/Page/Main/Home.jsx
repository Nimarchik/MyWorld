import { animated, useTransition } from '@react-spring/web';
import style from '../../assets/styles/index.module.css'
import Header from '../../components/Header';
import { Outlet, useLocation } from 'react-router';

const Home = () => {
  const location = useLocation();

  const transitions = useTransition(location, {
    from: {
      opacity: 0,
      transform: 'translateY(100%)',
      position: 'relative',
      flexGrow: 1,
    },
    enter: {
      opacity: 1,
      transform: 'translateY(0)',
      flexGrow: 1,
    },
  })
  return (
    <>
      <div className={style.space}></div>
      <div className={style.wrapper}>
        <Header />

        <main className={style.main}>

          {transitions((style, location) => (
            <animated.div className={style.animated} style={style}>
              <div className={style.container}>
                <Outlet location={location} />
              </div>
            </animated.div>
          ))}
        </main>
      </div>
    </>
  )
}

export default Home;