import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOptions, getIncompatibilities } from '../services/OptionsAPI'
import { createCar } from '../services/CarsAPI'
import { calcTotal, getDisabledIds } from '../utilities/compatibility'
import '../App.css'

const BASE_PRICE = 30000
const FEATURES = ['exterior', 'wheels', 'roof', 'interior']

const CreateCar = () => {
    const navigate = useNavigate()
    const [options, setOptions] = useState([])
    const [incompatibilities, setIncompatibilities] = useState([])
    const [selected, setSelected] = useState({})
    const [name, setName] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        const load = async () => {
            const [opts, incompat] = await Promise.all([getOptions(), getIncompatibilities()])
            setOptions(opts)
            setIncompatibilities(incompat)
            const defaults = {}
            FEATURES.forEach(f => {
                const first = opts.find(o => o.feature === f)
                if (first) defaults[f] = first.id
            })
            setSelected(defaults)
        }
        load()
    }, [])

    const selectedIds = Object.values(selected)
    const selectedOptions = options.filter(o => selectedIds.includes(o.id))
    const disabledIds = getDisabledIds(selectedIds, incompatibilities)
    const total = calcTotal(BASE_PRICE, selectedOptions)
    const exterior = options.find(o => o.id === selected.exterior)

    const choose = (feature, id) => {
        setSelected({ ...selected, [feature]: id })
        setError('')
    }

    const save = async () => {
        if (!name.trim()) return setError('Name your car first')
        const result = await createCar({
            name,
            wheel_id: selected.wheels,
            exterior_id: selected.exterior,
            roof_id: selected.roof,
            interior_id: selected.interior
        })
        result.error ? setError(result.error) : navigate(`/customcars/${result.data.id}`)
    }

    return (
        <div className="create">
            <h2>Customize your Bolt Bucket</h2>

            <div className="preview" style={{ backgroundColor: exterior?.color || '#222' }}>
                <span className="preview-price">${total.toLocaleString()}</span>
            </div>

            <input
                placeholder="Name your car"
                value={name}
                onChange={e => setName(e.target.value)}
            />

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
            <button className="save" onClick={save}>Save Car</button>
        </div>
    )
}

export default CreateCar
