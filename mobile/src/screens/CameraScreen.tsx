import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { theme } from '../theme';
import { X, Camera as CameraIcon, RefreshCcw, Check, ArrowLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';

const CameraScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { purpose = 'verification' } = route.params || {}; // 'verification' or 'portfolio'
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted' && mediaStatus === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          skipProcessing: true
        });
        setPhoto(photo.uri);
      } catch (err) {
        console.error('Failed to take picture', err);
      }
    }
  };

  const savePhoto = async () => {
    if (photo) {
      if (purpose === 'portfolio') {
        await MediaLibrary.saveToLibraryAsync(photo);
      }
      // Pass back the photo URI to the previous screen
      navigation.navigate({
        name: route.params?.onSuccessScreen || 'Profile',
        params: { photoUri: photo },
        merge: true,
      } as any);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container} />;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.preview} />
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setPhoto(null)} data-testid="button-retake-photo">
            <RefreshCcw size={32} color="#fff" />
            <Text style={styles.actionText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.confirmButton]} onPress={savePhoto} data-testid="button-confirm-photo">
            <Check size={32} color="#fff" />
            <Text style={styles.actionText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} data-testid="button-close-camera">
              <X size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{purpose === 'verification' ? 'ID Verification' : 'Portfolio Photo'}</Text>
            <TouchableOpacity onPress={() => setFacing(facing === 'back' ? 'front' : 'back')} data-testid="button-flip-camera">
              <RefreshCcw size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {purpose === 'verification' && (
            <View style={styles.guideFrame}>
              <View style={styles.idOutline} />
              <Text style={styles.guideText}>Align your ID within the frame</Text>
            </View>
          )}

          <View style={styles.bottomBar}>
            <View style={{ width: 44 }} />
            <TouchableOpacity style={styles.captureButton} onPress={takePicture} data-testid="button-capture-photo">
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  preview: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'space-between' },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bottomBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    paddingBottom: 40,
    paddingHorizontal: 30
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40
  },
  actionButton: { alignItems: 'center' },
  confirmButton: { 
    backgroundColor: theme.colors.primary, 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    justifyContent: 'center',
    marginTop: -20
  },
  actionText: { color: '#fff', marginTop: 8, fontWeight: 'bold' },
  guideFrame: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  idOutline: { 
    width: '85%', 
    height: 220, 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.7)', 
    borderRadius: 16,
    borderStyle: 'dashed'
  },
  guideText: { color: '#fff', marginTop: 20, fontSize: 16, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 },
  text: { color: '#fff', fontSize: 18, textAlign: 'center', marginTop: 100 },
  button: { alignSelf: 'center', padding: 15, backgroundColor: theme.colors.primary, borderRadius: 10, marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});

export default CameraScreen;