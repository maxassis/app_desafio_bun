import React from 'react'
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface PermissionModalProps {
  visible: boolean
  onAccept: () => void
  onDecline: () => void
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onDecline}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Ative a localização do seu dispositivo</Text>
          <Text style={styles.modalText}>
            Os serviços de localização estão desativados. Ligue o GPS do dispositivo para que possamos iniciar o rastreamento da sua atividade.
          </Text>

          <View style={styles.permissionItem}>
            <Image source={require('../../assets/map-pin-black.svg')} style={styles.icon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.permissionTitle}>Abra as configurações</Text>
              <Text style={styles.permissionDescription}>
                Ative os serviços de localização do seu celular.
              </Text>
            </View>
          </View>

          <View style={styles.permissionItem}>
            <Image source={require('../../assets/track.svg')} style={styles.icon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.permissionTitle}>Volte ao app</Text>
              <Text style={styles.permissionDescription}>
                Assim que o GPS estiver ligado, continuamos a configuração.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <Text style={styles.acceptButtonText}>Continuar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDecline}>
            <Text style={styles.declineButtonText}>Agora não</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export { PermissionModal }

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 15,
  },
  permissionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#666',
    flexShrink: 1,
  },
  instructionsContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: '100%',
  },
  instructionsText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'left',
    marginBottom: 10,
  },
  instructionsStep: {
    fontSize: 14,
    color: '#333',
    textAlign: 'left',
    marginBottom: 5,
  },
  acceptButton: {
    backgroundColor: '#74FE52',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    elevation: 2,
    width: '100%',
    marginBottom: 10,
  },
  acceptButtonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  declineButtonText: {
    color: '#999',
    fontSize: 14,
  },
})
