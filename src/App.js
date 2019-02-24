import React, { Component } from 'react'
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react'
import Geocode from "react-geocode"
import ReactNotification from "react-notifications-component"
import "react-notifications-component/dist/theme.css"

Geocode.setApiKey("AIzaSyBn4o0Z-bBXL_jhcFwdX8gpa0L20UAmrj8")

const mapStyles = {
  map: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  }
}


export class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.addNotification = this.addNotification.bind(this);
    this.notificationDOMRef = React.createRef();
  }

  state = {
    latitude: 0,
    longitude:0,
    temperature: '',
    country: '',
    activeMarker: {},
    showingInfoWindow: false,
    selectedPlace: {}
  };

  addNotification(title, message, type) {
    this.notificationDOMRef.current.addNotification({
      title,
      message,
      type,
      insert: "top",
      container: "top-right",
      animationIn: ["animated", "fadeIn"],
      animationOut: ["animated", "fadeOut"],
      dismissable: { click: true }
    });
  }


  mapClicked(mapProps, map, clickEvent) {
    Geocode.fromLatLng(clickEvent.latLng.lat(), clickEvent.latLng.lng()).then(
      response => {
        const countryObj = response.results[response.results.length - 1]
        const latitude = countryObj.geometry.location.lat
        const longitude = countryObj.geometry.location.lng
        const country = countryObj.formatted_address
        fetch(`${window.location.href}api/v1/${encodeURI(country)}/${latitude}/${longitude}`)
          .then((response) => {
            return response.json()
          })
          .then((data) => {
            this.setState({
              country,
              latitude,
              longitude,
              temperature: data.currently.temperature
            })
            this.addNotification(this.state.country, `Temperaure: ${this.state.temperature}`, 'success')
          }).catch(reason => {
            this.addNotification('Error', 'Contact us', 'danger')
          })
      },
      error => {
        this.addNotification('Error', 'Contact us', 'danger')
      }
    )
  }

  onMarkerClick = (props, marker, e) =>
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });

  render() {
    return (
      <Map
        google={this.props.google}
        zoom={2}
        maxZoom={2}
        minZoom={2}
        style={mapStyles}
        temperature={null}
        initialCenter={{
         lat: this.state.latitude,
         lng: this.state.longitude
        }}
        onClick={this.mapClicked.bind(this)}
      >
        <Marker
          title={this.state.country}
          position={{lat: this.state.latitude, lng: this.state.longitude}} />
        <ReactNotification ref={this.notificationDOMRef} />
      </Map>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyBfEvBiiKqZwqPLIeD6rZst6y8x2NicQpc'
})(MapContainer);