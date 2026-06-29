import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCars, deleteCar } from '../services/CarsAPI'
import { getOptions } from '../services/OptionsAPI'
import '../App.css'

const ViewCars = () => {
    const [cars, setCars] = useState([])
    const [options, setOptions] = useState([])

    useEffect(() => {
        const load = async () => {
            const [c, o] = await Promise.all([getCars(), getOptions()])
            setCars(c)
            setOptions(o)
        }
        load()
    }, [])

    const colorOf = (car) => options.find(o => o.id === car.exterior_id)?.color || '#222'

    const remove = async (id) => {
        await deleteCar(id)
        setCars(cars.filter(c => c.id !== id))
    }

    if (cars.length === 0)
        return (
            <div className="list">
                <h2>Custom Cars</h2>
                <p>No cars yet. <Link to="/">Build one »</Link></p>
            </div>
        )

    return (
        <div className="list">
            <h2>Custom Cars</h2>
            <div className="car-grid">
                {cars.map(car => (
                    <div key={car.id} className="car-card">
                        <Link to={`/customcars/${car.id}`} className="car-link">
                            <div className="car-swatch" style={{ backgroundColor: colorOf(car) }} />
                            <h3>{car.name}</h3>
                            <p>${car.total_price.toLocaleString()}</p>
                        </Link>
                        <div className="car-actions">
                            <Link to={`/edit/${car.id}`}>Edit</Link>
                            <button onClick={() => remove(car.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ViewCars
