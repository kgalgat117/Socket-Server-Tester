import React, { useState } from 'react'
import './App.css';
import { io } from "socket.io-client";

var _Socket;

export function App() {

  const [socketConfig, setSocketConfig] = useState({ protocol: 'http://', domain: 'localhost:3009', transports: 'polling', id: '', status: 'Disconnected', errorMsg: '' })
  const [eventData, setEventData] = useState({ name: '', data: {}, temp: { key: '', value: '' } })

  const connectToServer = () => {
    if (socketConfig.status === "Disconnected") {
      if (validateSocketConfig()) {
        const Socket = io(`${socketConfig.protocol}${socketConfig.domain}`, { transports: [socketConfig.transports] });

        Socket.on('connect', (data) => {
          let temp = { ...socketConfig }
          temp.status = "Connected"
          temp.id = Socket.id
          setSocketConfig(temp)
        })
        Socket.on("disconnect", (reason) => {
          let temp = { ...socketConfig }
          temp.status = 'Disconnected'
          temp.errorMsg = reason
          setSocketConfig(temp)
        });
        _Socket = Socket
      }
    } else {
      if (_Socket) {
        _Socket.disconnect()
      }
    }
  }

  const validateSocketConfig = () => {
    if (socketConfig.protocol && socketConfig.domain && socketConfig.transports) {
      return true
    }
    return false
  }

  const socketFieldChange = (event) => {
    let temp = { ...socketConfig }
    temp[event.target.name] = event.target.value
    setSocketConfig(temp)
  }

  const addEventData = () => {
    let temp = { ...eventData }
    temp.data[temp.temp.key] = temp.temp.value
    temp.temp.key = ''
    temp.temp.value = ''
    setEventData(temp)
  }

  const tempEventDataChange = (event) => {
    let temp = { ...eventData }
    if (event.target.name === 'name') {
      temp.name = event.target.value
    } else {
      temp.temp[event.target.name] = event.target.value
    }
    setEventData(temp)
  }

  const createEvent = () => {
    if (validateCreateEventData()) {
      _Socket.emit(eventData.name, eventData.data)
    }
  }

  const validateCreateEventData = () => {
    if (_Socket) {
      if (socketConfig.status === 'Connected') {
        if (eventData.name) {
          return true
        }
      }
    }
    return false
  }

  return (
    <div className="container-fluid bg-info max">
      <div className="row max">
        <div className="col-md-6 border border-1 border-danger">
          <div className="row">
            <div className="col">
              <label htmlFor="basic-url" className="form-label">Socket Server URL</label>
              <div className="input-group mb-3">
                <select value={socketConfig.protocol} onChange={socketFieldChange} name="protocol" className="input-group-text" id="basic-addon3" >
                  <option value="http://">HTTP</option>
                  <option value="https://">HTTPS</option>
                  <option value="ws://">WS</option>
                  <option value="wss://">WSS</option>
                </select>
                <input type="text" className="form-control" value={socketConfig.domain} placeholder="localhost:3009" name="domain" onChange={socketFieldChange} id="basic-url" aria-describedby="basic-addon3" />
              </div>
            </div>
            <div className="col">
              <label htmlFor="basic-url" className="form-label">Socket Transport</label>
              <select className="form-select" value={socketConfig.transports} name="transports" onChange={socketFieldChange} aria-label="Default select example">
                <option value="polling">Polling</option>
                <option value="websocket">Web Socket</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="input-group mb-3">
                <button onClick={connectToServer} disabled={!validateSocketConfig()} type="button" className="btn btn-warning"> {(socketConfig.status === 'Connected' ? "Disconnect" : "Connect")} </button>
              </div>
            </div>
            <div className="col-md-6">
              <div className="input-group mb-3">
                <button type="button" className={"btn position-absolute top-0 end-0 " + (socketConfig.status === 'Connected' ? "btn-success" : "btn-danger")}>{socketConfig.status}</button>
                {socketConfig.status === "Disconnected" && socketConfig.errorMsg &&
                  <span className="badge bg-danger">{socketConfig.errorMsg} </span>
                }
                {socketConfig.status === "Connected" && socketConfig.id &&
                  <span className="badge bg-success">{socketConfig.id} </span>
                }
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 border border-1 border-danger">
          <div className="row">
            <div className="col-8">
              <div className="row">
                <div className="col-4">
                  <label htmlFor="event-name" className="form-label">Event Name</label>
                  <div className="input-group mb-3">
                    <input value={eventData.name} name="name" onChange={tempEventDataChange} type="text" className="form-control" placeholder="test" id="event-name" />
                  </div>
                </div>
                <div className="col-8">
                  <label htmlFor="event-name" className="form-label">Event Data</label>
                  <div className="row">
                    <div className="col">
                      <div className="input-group mb-3">
                        <input value={eventData.temp.key} name="key" onChange={tempEventDataChange} type="text" placeholder="key" className="form-control" />
                      </div>
                    </div>
                    <div className="col">
                      <div className="input-group mb-3">
                        <input value={eventData.temp.value} name="value" type="text" onChange={tempEventDataChange} className="form-control" placeholder="value" />
                      </div>
                    </div>
                    <div className="col">
                      <div className="input-group mb-3">
                        <button onClick={addEventData} type="button" className={"btn btn-primary "}>Add</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <div className="input-group mb-3">
                    <button onClick={createEvent} disabled={!validateCreateEventData()} type="button" className="btn btn-warning"> Create Event </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="max border border-1 border-warning overflow-scroll text-wrap">
                {JSON.stringify(eventData.data)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
