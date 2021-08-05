import { Suspense } from 'react'
import {
  RecoilRoot,
  atom,
  selector,
  selectorFamily,
  useRecoilValue,
  //useSetRecoilState,
  useRecoilCallback
} from 'recoil'

const currentWhaleTypesQuery = selector({
  key: 'CurrentWhaleTypesQuery',
  get: async () => {
    const response = await fetch('/whaleTypes')
    return await response.json()
  }
})

const currentWhaleIdState = atom({
  key: 'CurrentWhaleIdState',
  default: ''
})

const whaleInfoQuery = selectorFamily({
  key: 'WhaleInfoQuery',
  get: whaleId => async () => {
    if (whaleId === '') return undefined

    const response = await fetch('/whales/' + whaleId)
    return await response.json()
  }
})

const currentWhaleQuery = selector({
  key: 'CurrentWhaleQuery',
  get: ({get}) =>
    get(whaleInfoQuery(get(currentWhaleIdState)))
})

function CurrentWhaleTypes() {
  const whaleTypes = useRecoilValue(currentWhaleTypesQuery)
  //const setWhaleId = useSetRecoilState(currentWhaleIdState)

  const changeWhale = useRecoilCallback(
    ({snapshot, set}) => whaleId => {
      snapshot.getLoadable(whaleInfoQuery(whaleId))
      set(currentWhaleIdState, whaleId)
    }
  )

  return (
    <ul>
      {whaleTypes.map(whale =>
        <li key={whale.id}>
          <a
            href={"#" + whale.id}
            onClick={(e) => {
              e.preventDefault()
              //setWhaleId(whale.id)
              changeWhale(whale.id)
            }}
          >
            {whale.name}
          </a>
        </li>
      )}
    </ul>
  )
}

function CurrentWhalePick() {
  const whale = useRecoilValue(currentWhaleQuery)

  return (
    <>
      {whale === undefined
        ? <p>Please choose a whale.</p>
        : <>
            <h3>{whale.name}</h3>
            <p>Life span: {whale.maxLifeSpan} yrs</p>
            <p>Diet: {whale.diet} ({whale.favoriteFood})</p>
            <p>Length: {whale.maxLengthInFt} ft</p>
            <p>{whale.description}</p>
            <img alt={whale.id} src={whale.imgSrc} />
          </>
      }
    </>
  )
}

function CurrentWhaleIdValue() {
  const whaleId = useRecoilValue(currentWhaleIdState)

  return (
    <span>{whaleId.replace('_', ' ')}</span>
  )
}

const App = () =>
<RecoilRoot>
  <Suspense fallback={<div>Loading whale types...</div>}>
    <CurrentWhaleTypes />
    <Suspense fallback={
      <div>Loading <CurrentWhaleIdValue /> info...</div>
    }>
      <CurrentWhalePick />
    }
    </Suspense>
  </Suspense>
</RecoilRoot>

export { App }
