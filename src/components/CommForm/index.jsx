import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../services/api';

import InteractiveMap, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css';

import { Button, Modal, Form, Row, Col, Alert} from 'react-bootstrap';
import { MaskedInput } from '../../utils/MaskedInput';

export function CommForm({ communications, commId, onClose, show, loadData, isNew, setIsNew }){
  const [cpf, setCpf] = useState('')
  const [warning, setWarning] = useState(false)
  const [loading, setLoading] = useState(false)

  const [comm, setComm] = useState({})

  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (communications && commId !== null) {
      const lossComm = communications.filter(comm => comm.id === commId)[0];
      const item = {
        name: lossComm.name,
        email: lossComm.email,
        cpf: lossComm.cpf,
        type_farming: lossComm.type_farming,
        event: lossComm.event,
        date: lossComm.date,
        lat: lossComm.lat,
        lng: lossComm.lng
      }

      setCpf(lossComm.cpf)
      setComm(item)
    } else {
      const item = {
        name: '',
        email: '',
        cpf: '',
        type_farming: '',
        event: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        lat: '',
        lng: '',
      }
      setCpf('')
      setComm(item)
      setValidated(false)
    }
    setLoading(true)
  }, [commId, communications, isNew]);

  const eventOptions = [
    {
      value: "1",
      label: "Chuva Excessiva"
    },
    {
      value: "2",
      label: "Geada"
    },
    {
      value: "3",
      label:  "Granizo"
    },
    {
      value: "4",
      label: "Seca"
    },
    {
      value: "5",
      label: "Vendaval"
    },
    {
      value: "6",
      label: "Raio"
    }
  ]

  function handleFormValueChange(e) {
    e.preventDefault();
    setComm({...comm, [e.target.name]: e.target.value})
    setWarning(false)
  }

  function handleClickOnMap(e) {
    e.preventDefault();
    const [lng, lat] = Object.values(e.lngLat)
    setComm({...comm, 'lng': lng, 'lat': lat})
  }

  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  function getDistance(lon1, lat1, lon2, lat2){
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
  }

  async function handleSubmit(e) {
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }
    setValidated(true);

    // Verificar distancias entre coordenadas
    var isDivergence = false;
    communications.forEach((communication, i) => {
      var distance = getDistance(communication.lng, communication.lat, comm.lng, comm.lat)

      if (distance < 10.0 && communication.date === comm.date && communication.event !== eventOptions[Number(comm.event - 1)].label) {
        isDivergence = true
        setWarning(isDivergence)
      }
    })

    if (!isDivergence) {
      const dataWithCpf = ({...comm, 'cpf': cpf.replace('.', '').replace('.', '').replace('-', '')})

      if (commId) {
        const response = await api.put(`/loss_communication/${commId}`, dataWithCpf)
        if (response.status === 201) {
          window.alert('Registro alterado com sucesso!')
          setValidated(false);
        }
      }
      else {
        const response = await api.post('/loss_communication', dataWithCpf)
        if (response.status === 201) {
          window.alert('Registro criado com sucesso!')
          setValidated(false);
        }
      }

      // Sucesso
      onClose();
      setWarning(isDivergence)
      loadData()
    }
  }

  function handleModalClose() {
    setComm({
      name: '',
      email: '',
      cpf: '',
      type_farming: '',
      event: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      lat: '',
      lng: '',
    })
    setLoading(false)
    setCpf('')
    setIsNew(false)
    setWarning(false)
  }

  return (
    <Modal show={show} onHide={onClose} size="lg" onExit={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Comunicação de Perda</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <Form noValidate validated={validated}>
            <Row>
              <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    required
                    size="sm"
                    type="text"
                    name="name"
                    value={comm.name}
                    onChange={(e) => handleFormValueChange(e)}
                    autoFocus
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={6}>
              <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Data</Form.Label>
                  <Form.Control
                    required
                    size="sm"
                    type="date"
                    name="date"
                    value={comm.date ? comm.date : new Date('yyyy-MM-dd')}
                    onChange={(e) => handleFormValueChange(e)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    required
                    size="sm"
                    type="email"
                    name="email"
                    value={comm.email}
                    onChange={(e) => handleFormValueChange(e)}
                    placeholder="name@example.com"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>CPF</Form.Label>
                  <MaskedInput value={cpf} onChange={(e) => setCpf(e.target.value)} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col xs={6} md={6}>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Tipo lavoura:</Form.Label>
                  <Form.Control
                    required
                    size="sm"
                    type="text"
                    name="type_farming"
                    value={comm.type_farming}
                    onChange={(e) => handleFormValueChange(e)}
                    style={{textTransform: 'capitalize'}}
                    disabled={commId ? true : false}
                  />
                </Form.Group>
              </Col>

              {commId ?
                <Col xs={6} md={6}>
                  <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Causalidade:</Form.Label>
                    <Form.Control
                      required
                      size="sm"
                      type="text"
                      name="event"
                      value={comm.event}
                      style={{textTransform: 'capitalize'}}
                      disabled={commId ? true : false}
                    />
                  </Form.Group>
                </Col>
                :
                <Col xs={6} md={6}>
                  <Form.Group>
                    <Form.Label>Causalidade</Form.Label>
                    <Form.Control  size="sm" required as="select" value={comm.event} name={"event"} onChange={(e) => handleFormValueChange(e)}>
                      <option key={'empty'} value={''}>Selecione...</option>
                      {eventOptions.map(({value, label}) =>
                          <option key={value} value={value} name={label}>{label}</option>
                        )}
                      </Form.Control>
                  </Form.Group>
                </Col>
              }
            </Row>

            <Row>
              <Col xs={6} md={6}>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Latitude</Form.Label>
                  <Form.Control
                    required
                    size="sm"
                    type="text"
                    name="latitude"
                    value={comm.lat}
                    onChange={(e) => handleFormValueChange(e)}
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={6}>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>Longitude</Form.Label>
                  <Form.Control
                    required
                    size="sm"
                    type="text"
                    name="longitude"
                    value={comm.lng}
                    onChange={(e) => handleFormValueChange(e)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {warning && <Alert key='warning' variant='warning'>
              Cuidado - Eventos divergentes!
            </Alert>}

            {loading && <Row>
            <div style={{width: '100%', height: 400}}>
              <InteractiveMap
                initialViewState={{
                  longitude: !isNew ? comm.lng : -52.6794792,
                  latitude: !isNew ? comm.lat :  -26.2437336,
                  zoom: 12
                }}
                style={{width: '100%', height: 400}}
                mapStyle="mapbox://styles/mapbox/streets-v9"
                mapboxAccessToken="pk.eyJ1IjoibWFzc3VjYXR0b2oiLCJhIjoiY2wybTRranY3MHBzdzNkcnFhMmd2dTNraiJ9.iEnDPrgApFV9Q396DKRHuw"
                onClick={(e) => handleClickOnMap(e)}
              >
                <Marker longitude={comm.lng} latitude={comm.lat} anchor="bottom" color="#E50674" />
              </InteractiveMap>
             </div>
           </Row>}
          </Form>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" type="submit" onClick={handleSubmit}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>
  );
}