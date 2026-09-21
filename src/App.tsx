import { useEffect, useState } from 'react'
import type { PointerEvent } from 'react'
import './App.css'

type TouchType = 'intentional' | 'accidental' | null

type TouchSample = {
  x: number
  y: number
  edgeDistance: number
  duration: number
  movement: number
  pressure: number
  width: number
  speed: number
  pointerType: string
  label: 'intentional' | 'accidental'
}

const STORAGE_KEY = 'chhoomat_samples'

function App() {
  const [touchType, setTouchType] =
    useState<TouchType>(null)

  const [modelConfidence, setModelConfidence] =
    useState<number | null>(null)

  const [isPredicting, setIsPredicting] =
    useState(false)

  const [touchPosition, setTouchPosition] =
    useState({
      x: 0,
      y: 0,
    })

  const [edgeDistance, setEdgeDistance] =
    useState<number | null>(null)

  const [touchDuration, setTouchDuration] =
    useState<number | null>(null)

  const [movementDistance, setMovementDistance] =
    useState<number | null>(null)

  const [touchPressure, setTouchPressure] =
    useState<number | null>(null)

  const [touchSize, setTouchSize] =
    useState<number | null>(null)

  const [touchSpeed, setTouchSpeed] =
    useState<number | null>(null)

  const [pointerType, setPointerType] =
    useState<string | null>(null)

  const [touchStartTime, setTouchStartTime] =
    useState<number | null>(null)

  const [touchStartPosition, setTouchStartPosition] =
    useState({
      x: 0,
      y: 0,
    })

  const [touchStartPointerType, setTouchStartPointerType] =
    useState<string>('unknown')

  /*
    LOAD SAVED DATASET
  */

  const [samples, setSamples] =
    useState<TouchSample[]>(() => {
      const savedSamples =
        localStorage.getItem(STORAGE_KEY)

      if (!savedSamples) {
        return []
      }

      try {
        return JSON.parse(savedSamples)
      } catch {
        return []
      }
    })

  /*
    SAVE DATASET AUTOMATICALLY
  */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(samples)
    )
  }, [samples])

  /*
    AI PREDICTION
  */

  const predictTouch = async ({
    edgeDistance,
    duration,
    movement,
    pressure,
    width,
    speed,
  }: {
    edgeDistance: number
    duration: number
    movement: number
    pressure: number
    width: number
    speed: number
  }) => {
    try {
      setIsPredicting(true)

      const response = await fetch(
        'http://127.0.0.1:8000/predict',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            edgeDistance,
            duration,
            movement,
            pressure,
            width,
            speed,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Prediction request failed')
      }

      const result = await response.json()

      setTouchType(result.prediction)
      setModelConfidence(
        typeof result.confidence === 'number'
          ? result.confidence
          : null
      )

      console.log(
        'AI prediction:',
        result.prediction,
        'Confidence:',
        result.confidence
      )
    } catch (error) {
      console.error(
        'Could not connect to ChhooMat AI:',
        error
      )

      setTouchType(null)
      setModelConfidence(null)

      alert(
        'Could not connect to ChhooMat AI. Make sure FastAPI is running on port 8000.'
      )
    } finally {
      setIsPredicting(false)
    }
  }

  /*
    TOUCH START
  */

  const handlePhoneTouchStart = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    const gameArea =
      event.currentTarget

    const rect =
      gameArea.getBoundingClientRect()

    const x =
      event.clientX - rect.left

    const y =
      event.clientY - rect.top

    const width =
      rect.width

    const height =
      rect.height

    const distanceFromLeft = x
    const distanceFromRight =
      width - x

    const distanceFromTop = y
    const distanceFromBottom =
      height - y

    const closestEdge =
      Math.min(
        distanceFromLeft,
        distanceFromRight,
        distanceFromTop,
        distanceFromBottom
      )

    const roundedX =
      Math.round(x)

    const roundedY =
      Math.round(y)

    const roundedEdge =
      Math.round(closestEdge)

    const startTime =
      Date.now()

    const pressure =
      event.pressure

    const size =
      event.width

    const currentPointerType =
      event.pointerType || 'unknown'

    setTouchStartTime(
      startTime
    )

    setTouchStartPosition({
      x: roundedX,
      y: roundedY,
    })

    setTouchPosition({
      x: roundedX,
      y: roundedY,
    })

    setEdgeDistance(
      roundedEdge
    )

    setTouchPressure(
      pressure > 0
        ? pressure
        : null
    )

    setTouchSize(
      size > 0
        ? size
        : null
    )

    setPointerType(
      currentPointerType
    )

    setTouchStartPointerType(
      currentPointerType
    )

    setTouchSpeed(null)

    setMovementDistance(null)

    setTouchDuration(null)

    console.log(
      '-----------------------'
    )

    console.log(
      'Touch started!'
    )

    console.log(
      'X:',
      roundedX
    )

    console.log(
      'Y:',
      roundedY
    )

    console.log(
      'Edge distance:',
      roundedEdge
    )

    console.log(
      'Pressure:',
      pressure
    )

    console.log(
      'Touch width:',
      size
    )

    console.log(
      'Pointer type:',
      currentPointerType
    )

    console.log(
      'Start time:',
      startTime
    )

    console.log(
      '-----------------------'
    )
  }

  /*
    TOUCH END
  */

  const handlePhoneTouchEnd = async (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (
      touchStartTime === null
    ) {
      return
    }

    const gameArea =
      event.currentTarget

    const rect =
      gameArea.getBoundingClientRect()

    const endX =
      event.clientX - rect.left

    const endY =
      event.clientY - rect.top

    const roundedEndX =
      Math.round(endX)

    const roundedEndY =
      Math.round(endY)

    const deltaX =
      endX -
      touchStartPosition.x

    const deltaY =
      endY -
      touchStartPosition.y

    const distance =
      Math.sqrt(
        deltaX * deltaX +
        deltaY * deltaY
      )

    const roundedDistance =
      Math.round(distance)

    const endTime =
      Date.now()

    const duration =
      endTime -
      touchStartTime

    /*
      SPEED

      Movement is measured in pixels.

      Duration is converted from
      milliseconds to seconds.

      Result = pixels per second.
    */

    const speed =
      duration > 0
        ? distance /
          (duration / 1000)
        : 0

    const roundedSpeed =
      Math.round(
        speed * 100
      ) / 100

    setTouchDuration(
      duration
    )

    setMovementDistance(
      roundedDistance
    )

    setTouchSpeed(
      roundedSpeed
    )

    setTouchPosition({
      x: roundedEndX,
      y: roundedEndY,
    })

    setPointerType(
      event.pointerType ||
      touchStartPointerType
    )

    setTouchStartTime(
      null
    )

    console.log(
      '-----------------------'
    )

    console.log(
      'Touch ended!'
    )

    console.log(
      'End X:',
      roundedEndX
    )

    console.log(
      'End Y:',
      roundedEndY
    )

    console.log(
      'Duration:',
      duration,
      'ms'
    )

    console.log(
      'Movement:',
      roundedDistance,
      'px'
    )

    console.log(
      'Speed:',
      roundedSpeed,
      'px/s'
    )

    console.log(
      'Pointer type:',
      event.pointerType
    )

    console.log(
      '-----------------------'
    )

    // Send the completed touch to the trained ML model.
    await predictTouch({
      edgeDistance: edgeDistance ?? 0,
      duration,
      movement: roundedDistance,
      pressure: touchPressure ?? 0,
      width: touchSize ?? 0,
      speed: roundedSpeed,
    })
  }

  /*
    TOUCH CANCEL
  */

  const handlePhoneTouchCancel = () => {
    setTouchStartTime(null)

    console.log(
      'Touch cancelled'
    )
  }

  /*
    RECORD SAMPLE
  */

  const recordSample = (
    label:
      | 'intentional'
      | 'accidental'
  ) => {
    if (
      edgeDistance === null ||
      touchDuration === null ||
      movementDistance === null
    ) {
      alert(
        'Touch the phone first, then record the sample.'
      )

      return
    }

    const sample: TouchSample = {
      x:
        touchPosition.x,

      y:
        touchPosition.y,

      edgeDistance:
        edgeDistance,

      duration:
        touchDuration,

      movement:
        movementDistance,

      pressure:
        touchPressure ?? 0,

      width:
        touchSize ?? 0,

      speed:
        touchSpeed ?? 0,

      pointerType:
        pointerType ??
        touchStartPointerType ??
        'unknown',

      label,
    }

    setSamples(
      (previousSamples) => [
        ...previousSamples,
        sample,
      ]
    )

    console.log(
      'Sample recorded:',
      sample
    )
  }

  /*
    DOWNLOAD DATASET
  */

  const downloadDataset = () => {
    if (
      samples.length === 0
    ) {
      alert(
        'Record at least one touch sample first.'
      )

      return
    }

    const header =
      'x,y,edgeDistance,duration,movement,pressure,width,speed,pointerType,label'

    const rows =
      samples.map(
        (sample) =>
          [
            sample.x,
            sample.y,
            sample.edgeDistance,
            sample.duration,
            sample.movement,
            sample.pressure,
            sample.width,
            sample.speed,
            sample.pointerType,
            sample.label,
          ].join(',')
      )

    const csv = [
      header,
      ...rows,
    ].join('\n')

    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv;charset=utf-8;',
        }
      )

    const url =
      URL.createObjectURL(
        blob
      )

    const link =
      document.createElement(
        'a'
      )

    link.href = url

    link.download =
      'chhoomat_dataset.csv'

    document.body.appendChild(
      link
    )

    link.click()

    document.body.removeChild(
      link
    )

    URL.revokeObjectURL(
      url
    )

    console.log(
      'Dataset downloaded:',
      samples.length,
      'samples'
    )
  }

  /*
    CLEAR DATASET
  */

  const clearDataset = () => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete all collected samples?'
      )

    if (!confirmed) {
      return
    }

    setSamples([])

    setTouchType(null)
    setModelConfidence(null)

    localStorage.removeItem(
      STORAGE_KEY
    )

    console.log(
      'Dataset cleared'
    )
  }

  /*
    SAMPLE COUNTS
  */

  const intentionalSamples =
    samples.filter(
      (sample) =>
        sample.label ===
        'intentional'
    )

  const accidentalSamples =
    samples.filter(
      (sample) =>
        sample.label ===
        'accidental'
    )

  const intentionalCount =
    intentionalSamples.length

  const accidentalCount =
    accidentalSamples.length

  /*
    AVERAGE HELPER
  */

  const average = (
    values: number[]
  ) => {
    if (
      values.length === 0
    ) {
      return 0
    }

    const total =
      values.reduce(
        (sum, value) =>
          sum + value,
        0
      )

    return (
      total /
      values.length
    )
  }

  /*
    AVERAGE DURATION
  */

  const intentionalAverageDuration =
    average(
      intentionalSamples.map(
        (sample) =>
          sample.duration
      )
    )

  const accidentalAverageDuration =
    average(
      accidentalSamples.map(
        (sample) =>
          sample.duration
      )
    )

  /*
    AVERAGE MOVEMENT
  */

  const intentionalAverageMovement =
    average(
      intentionalSamples.map(
        (sample) =>
          sample.movement
      )
    )

  const accidentalAverageMovement =
    average(
      accidentalSamples.map(
        (sample) =>
          sample.movement
      )
    )

  /*
    AVERAGE EDGE DISTANCE
  */

  const intentionalAverageEdge =
    average(
      intentionalSamples.map(
        (sample) =>
          sample.edgeDistance
      )
    )

  const accidentalAverageEdge =
    average(
      accidentalSamples.map(
        (sample) =>
          sample.edgeDistance
      )
    )

  /*
    DATASET BALANCE

    50 / 50 is perfectly balanced.

    This value is only used to
    help us inspect the dataset.
  */

  const totalSamples =
    samples.length

  const balanceDifference =
    Math.abs(
      intentionalCount -
      accidentalCount
    )

  const datasetBalanced =
    totalSamples > 0 &&
    balanceDifference <=
      Math.ceil(
        totalSamples * 0.1
      )

  /*
    DATASET STATUS
  */

  const hasBothClasses =
    intentionalCount > 0 &&
    accidentalCount > 0

  /*
    AI CONFIDENCE

    This value comes from the
    trained Random Forest model
    through the FastAPI backend.
  */

  const confidence =
    modelConfidence

  return (
    <div className="app">

      {/* NAVBAR */}

      <header className="navbar">

        <div className="brand">

          <div className="brand-mark">
            C
          </div>

          <div>

            <h1>
              ChhooMat
            </h1>

            <p>
              Intelligent touch protection
            </p>

          </div>

        </div>

        <div className="system-status">

          <span></span>

          System active

        </div>

      </header>


      {/* INTRO */}

      <section className="intro">

        <p className="eyebrow">
          TOUCH INTELLIGENCE
        </p>

        <h2>
          Your screen should know
          <br />
          what you actually meant.
        </h2>

        <p className="description">
          ChhooMat analyzes touch
          behaviour to distinguish
          intentional interaction
          from accidental contact.
        </p>

      </section>


      {/* WORKSPACE */}

      <section className="workspace">


        {/* PHONE */}

        <div className="phone-container">

          <div className="phone">

            <div className="phone-camera">
            </div>

            <div className="screen">

              <div className="screen-top">

                <span>
                  ChhooMat
                </span>

                <span>
                  ●
                </span>

              </div>


              <div
                className="game"

                onPointerDown={
                  handlePhoneTouchStart
                }

                onPointerUp={
                  handlePhoneTouchEnd
                }

                onPointerCancel={
                  handlePhoneTouchCancel
                }
              >

                <div className="game-label">
                  TOUCH SIMULATOR
                </div>


                <div className="crosshair">
                  +
                </div>


                <div className="edge-zone">
                </div>


                {touchDuration !== null && (
                  <div className="touch-info">

                    {touchPosition.x}px,
                    {' '}
                    {touchPosition.y}px

                  </div>
                )}


                <button
                  className="action-button"

                  onPointerDown={(
                    event
                  ) => {
                    // Keep the button separate from
                    // the touch simulator.
                    event.stopPropagation()
                  }}
                >
                  +
                </button>

              </div>

            </div>

          </div>


          <p className="phone-caption">
            Touch anywhere inside the screen
          </p>

        </div>


        {/* ANALYSIS */}

        <div className="analysis">


          <div className="analysis-header">

            <h3>
              Live analysis
            </h3>

            <div className="protection">

              <span>
                Protection
              </span>

              <strong>
                ON
              </strong>

            </div>

          </div>


          {/* STATUS */}

          <div
            className={`status-card ${
              touchType ?? ''
            }`}
          >

            <div className="status-icon">

              {touchType ===
                'intentional'
                ? '✓'
                : touchType ===
                  'accidental'
                ? '×'
                : '•'}

            </div>


            <div>

              <div className="status-label">
                TOUCH CLASSIFICATION
              </div>

              <h4>

                {isPredicting &&
                  'Analyzing touch...'}

                {!isPredicting &&
                  touchType ===
                    'intentional' &&
                  'Intentional touch'}

                {!isPredicting &&
                  touchType ===
                    'accidental' &&
                  'Accidental touch'}

                {!isPredicting &&
                  !touchType &&
                  'Waiting for touch'}

              </h4>

            </div>

          </div>


          {/* METRICS */}

          <div className="metrics">

            <div>

              <span>
                Confidence
              </span>

              <strong>
                {confidence !== null
                  ? `${confidence}%`
                  : '—'}
              </strong>

            </div>


            <div>

              <span>
                Touch area
              </span>

              <strong>
                {touchSize !== null
                  ? `${touchSize}px`
                  : '—'}
              </strong>

            </div>


            <div>

              <span>
                Edge contact
              </span>

              <strong>
                {edgeDistance !== null
                  ? `${edgeDistance}px`
                  : '—'}
              </strong>

            </div>

          </div>


          {/* COORDINATES */}

          <div className="coordinate-panel">

            <div>

              <span>
                X coordinate
              </span>

              <strong>
                {touchPosition.x}px
              </strong>

            </div>


            <div>

              <span>
                Y coordinate
              </span>

              <strong>
                {touchPosition.y}px
              </strong>

            </div>

          </div>


          {/* TOUCH DETAILS */}

          <div className="duration-panel">

            <div>

              <span>
                Touch duration
              </span>

              <strong>

                {touchDuration !== null
                  ? `${touchDuration} ms`
                  : '—'}

              </strong>

            </div>


            <div>

              <span>
                Movement
              </span>

              <strong>

                {movementDistance !== null
                  ? `${movementDistance} px`
                  : '—'}

              </strong>

            </div>


            <div>

              <span>
                Speed
              </span>

              <strong>

                {touchSpeed !== null
                  ? `${touchSpeed} px/s`
                  : '—'}

              </strong>

            </div>


            <div>

              <span>
                Pressure
              </span>

              <strong>

                {touchPressure !== null
                  ? touchPressure
                  : '—'}

              </strong>

            </div>


            <div>

              <span>
                Pointer type
              </span>

              <strong>

                {pointerType ??
                  '—'}

              </strong>

            </div>

          </div>


          {/* DATASET */}

          <div className="duration-panel">

            <div>

              <span>
                Samples collected
              </span>

              <strong>
                {samples.length}
              </strong>

            </div>


            <div
              style={{
                marginTop:
                  '10px',

                paddingTop:
                  '10px',

                borderTop:
                  '1px solid #dededb',
              }}
            >

              <span>
                Intentional / Accidental
              </span>

              <strong>
                {intentionalCount}
                {' / '}
                {accidentalCount}
              </strong>

            </div>

          </div>


          {/* DATA QUALITY */}

          <div className="duration-panel">

            <div>

              <span>
                Average duration
              </span>

              <strong>

                {intentionalCount > 0
                  ? `${Math.round(
                      intentionalAverageDuration
                    )} ms`
                  : '—'}

                {' / '}

                {accidentalCount > 0
                  ? `${Math.round(
                      accidentalAverageDuration
                    )} ms`
                  : '—'}

              </strong>

            </div>


            <div
              style={{
                marginTop:
                  '10px',

                paddingTop:
                  '10px',

                borderTop:
                  '1px solid #dededb',
              }}
            >

              <span>
                Average movement
              </span>

              <strong>

                {intentionalCount > 0
                  ? `${Math.round(
                      intentionalAverageMovement
                    )} px`
                  : '—'}

                {' / '}

                {accidentalCount > 0
                  ? `${Math.round(
                      accidentalAverageMovement
                    )} px`
                  : '—'}

              </strong>

            </div>


            <div
              style={{
                marginTop:
                  '10px',

                paddingTop:
                  '10px',

                borderTop:
                  '1px solid #dededb',
              }}
            >

              <span>
                Average edge distance
              </span>

              <strong>

                {intentionalCount > 0
                  ? `${Math.round(
                      intentionalAverageEdge
                    )} px`
                  : '—'}

                {' / '}

                {accidentalCount > 0
                  ? `${Math.round(
                      accidentalAverageEdge
                    )} px`
                  : '—'}

              </strong>

            </div>

          </div>


          {/* DATASET STATUS */}

          {samples.length > 0 && (

            <div className="dataset-note">

              {!hasBothClasses ? (

                <p>
                  Collect both intentional
                  and accidental samples
                  before training the model.
                </p>

              ) : datasetBalanced ? (

                <p>
                  Dataset is currently
                  balanced. Continue
                  collecting samples with
                  different touch patterns.
                </p>

              ) : (

                <p>
                  Dataset contains both
                  classes, but the sample
                  counts are uneven.
                  Try to collect more
                  samples from the smaller
                  class.
                </p>

              )}

            </div>

          )}


          {/* BUTTONS */}

          <div className="actions">

            <button
              className="primary"

              onClick={() =>
                recordSample(
                  'intentional'
                )
              }
            >
              Record intentional
            </button>


            <button
              className="secondary"

              onClick={() =>
                recordSample(
                  'accidental'
                )
              }
            >
              Record accidental
            </button>


            <button
              className="secondary"

              onClick={
                downloadDataset
              }
            >
              Download dataset
            </button>


            <button
              className="secondary"

              onClick={
                clearDataset
              }
            >
              Clear dataset
            </button>

          </div>


          {/* HOW IT WORKS */}

          <div className="how-it-works">

            <p className="eyebrow">
              HOW IT WORKS
            </p>

            <p>
              ChhooMat observes touch
              position, edge distance,
              duration, movement,
              pressure, touch size,
              speed and pointer type.
              These signals are sent to
              the trained Random Forest
              model, which predicts whether
              the touch was intentional
              or accidental.
            </p>

          </div>

        </div>

      </section>


      {/* FOOTER */}

      <footer>
        ChhooMat — Touch intelligence
        prototype
      </footer>

    </div>
  )
}

export default App