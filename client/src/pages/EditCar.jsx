import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOptions, getIncompatibilities } from '../services/OptionsAPI'
import { getCar, updateCar } from '../services/CarsAPI'
import { calcTotal, getDisabledIds } from '../utilities/compatibility'
import '../App.css'

const BASE_PRICE = 30000
const FEATURES = ['exterior', 'wheels', 'roof', 'interior']

const EditCar = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [options, setOptions] = useState([])
    const [incompatibilities, setIncompatibilities] = useState([])
    const [selected, setSelected] = useState({})
    const [name, setName] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        const load = async () => {
            const [opts, incompat, car] = await Promise.all([
                getOptions(), getIncompatibilities(), getCar(id)
            ])
            setOptions(opts)
            setIncompatibilities(incompat)
            if (car && car.id) {
                setName(car.name)
                setSelected({
                    exterior: car.exterior_id,
                    wheels: car.wheel_id,
                    roof: car.roof_id,
                    interior: car.interior_id
                })
            }
        }
        load()
    }, [id])

    const selectedIds = Object.values(selected)
    const selectedOptions = options.filter(o => selectedIds.includes(o.id))
    const disabledIds = getDisabledIds(selectedIds, incompatibilities)
    const total = calcTotal(BASE_PRICE, selectedOptions)
    const exterior = options.find(o => o.id === selected.exterior)

    const choose = (feature, optId) => {
        setSelected({ ...selected, [feature]: optId })
        setError('')
    }

    const save = async () => {
        if (!name.trim()) return setError('Name your car first')
        const result = await updateCar(id, {
            name,
            wheel_id: selected.wheels,
            exterior_id: selected.exterior,
            roof_id: selected.roof,
            interior_id: selected.interior
        })
        result.error ? setError(result.error) : navigate(`/customcars/${id}`)
    }

    return (
        <div className="create">
            <h2>Edit your Bolt Bucket</h2>

            <div className="preview" style={{ backgroundColor: exterior?.color || '#222' }}>
                <div className="preview-specs">
                    {FEATURES.map(f => {
                        const o = options.find(x => x.id === selected[f])
                        return o ? <span key={f} className="preview-tag">{o.name}</span> : null
                    })}
                </div>
                <span className="preview-price">${total.toLocaleString()}</span>
            </div>

            <input placeholder="Name your car" value={name} onChange={e => setName(e.target.value)} />

            {FEATURES.map(feature => (
                <div key={feature} className="feature">
                    <h3>{feature}</h3>
                    <div className="option-row">
                        {options.filter(o => o.feature === feature).map(o => {
                            const isDisabled = disabledIds.has(o.id)
                            return (
                                <button
                                    key={o.id}
                                    className={selected[feature] === o.id ? 'selected' : ''}
                                    disabled={isDisabled}
                                    title={isDisabled ? 'Incompatible with current selection' : ''}
                                    onClick={() => choose(feature, o.id)}
                                >
                                    {o.color && <span className="swatch" style={{ backgroundColor: o.color }} />}
                                    {o.name}{o.price > 0 && ` (+$${o.price})`}
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}

            {error && <p className="error">{error}</p>}
            <button className="save" onClick={save}>Update Car</button>
        </div>
    )
}

export default EditCar
