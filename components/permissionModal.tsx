import React from 'react'
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface PermissionModalProps {
  visible: boolean
  onAccept: () => void
  onDecline: () => void
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
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
          <Text style={styles.modalTitle}>Ative os Serviços de Localização</Text>
          <Text style={styles.modalText}>
            Permita que o app acesse sua localização para que você possa registrar suas atividades, ver seu percurso no mapa e analisar suas estatísticas.
          </Text>

          <View style={styles.permissionItem}>
            <Image source={require('../assets/map-pin-black.svg')} style={styles.icon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.permissionTitle}>Ver sua atividade no mapa</Text>
              <Text style={styles.permissionDescription}>
                Requer acesso à localização enquanto o app está aberto.
              </Text>
            </View>
          </View>

          <View style={styles.permissionItem}>
            <Image source={require('../assets/track.svg')} style={styles.icon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.permissionTitle}>Grave a atividade com a tela bloqueada</Text>
              <Text style={styles.permissionDescription}>
                Requer acesso à localização mesmo quando o app está em segundo plano.
              </Text>
            </View>
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Para garantir que tudo funcione, o sistema operacional pedirá que você aprove duas permissões. Por favor, escolha:
            </Text>
            <Text style={styles.instructionsStep}>
              1. Localização:
              <Text style={{ fontWeight: 'bold' }}>'Permitir durante o uso do aplicativo'</Text>
            </Text>
            <Text style={styles.instructionsStep}>
              2. Localização em segundo plano:
              <Text style={{ fontWeight: 'bold' }}>'Permitir o tempo todo'</Text>
            </Text>
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
