import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCar, deleteCar } from '../services/CarsAPI'
import { getOptions } from '../services/OptionsAPI'
import '../App.css'

const FEATURES = ['exterior', 'wheels', 'roof', 'interior']

const CarDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [car, setCar] = useState(null)
    const [options, setOptions] = useState([])

    useEffect(() => {
        const load = async () => {
            const [c, o] = await Promise.all([getCar(id), getOptions()])
            setCar(c)
            setOptions(o)
        }
        load()
    }, [id])

    if (!car) return <div className="details"><p>Loading…</p></div>
    if (!car.id) return <div className="details"><p>Car not found. <Link to="/customcars">Back</Link></p></div>

    const fk = { exterior: car.exterior_id, wheels: car.wheel_id, roof: car.roof_id, interior: car.interior_id }
    const optionFor = (feature) => options.find(o => o.id === fk[feature])
    const exterior = optionFor('exterior')

    const remove = async () => {
        await deleteCar(car.id)
        navigate('/customcars')
    }

    return (
        <div className="details">
            <h2>{car.name}</h2>
            <div className="preview" style={{ backgroundColor: exterior?.color || '#222' }}>
                <span className="preview-price">${car.total_price.toLocaleString()}</span>
            </div>
            <ul className="spec">
                {FEATURES.map(f => {
                    const o = optionFor(f)
                    return (
                        <li key={f}>
                            <strong>{f}:</strong> {o?.name || '—'}{o?.price > 0 && ` (+$${o.price})`}
                        </li>
                    )
                })}
            </ul>
            <div className="car-actions">
                <Link to={`/edit/${car.id}`} role="button">Edit</Link>
                <button onClick={remove}>Delete</button>
            </div>
        </div>
    )
}

export default CarDetails
