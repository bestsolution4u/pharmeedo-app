import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  useDynamicStyleSheet,
  useDarkMode,
  useDynamicValue,
} from 'react-native-dark-mode';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import validator from 'validator';
import DropdownAlert from 'react-native-dropdownalert';
import {useDispatch, useSelector} from 'react-redux';
import {get, map} from 'lodash';
import {Dropdown} from 'react-native-material-dropdown-v2';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {ActionCreators} from '@actions';
import {Utils, Constants, ResponsiveUtils, Colors} from '@common';
import I18n from '@common/I18n';
import TextInput from '@components/TextInput';
import ImageServices from '@services/ImageServices';
import {styles as dynamicStyles} from './style';
const {CLOSE_INTERVAL_ALERT_SUCCESS, CLOSE_INTERVAL_ALERT_ERROR} = Constants;

const options = {
  title: 'Select Photo',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

const EditProduct = (props) => {
  const {navigation} = props;
  const product = navigation.getParam('data');
  const styles = useDynamicStyleSheet(dynamicStyles);
  const isDarkMode = useDarkMode();

  const [photos, setPhotos] = useState(
    product.images ? map(product.images, 'src') : [],
  );
  const [sku, setSku] = useState(product.sku);
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(get(product, 'category.id'));
  const [salePrice, setSalePrice] = useState('' + product.sale_price);
  const [regularPrice, setRegularPrice] = useState('' + product.regular_price);
  const [desc, setDesc] = useState(product.description);
  const [isEditing, setIsEditing] = useState(false);
  const dropdownAlertRef = useRef('');
  const dispatch = useDispatch();

  const isOfflineMode = useSelector(
    (state) => state.settingReducers.isOfflineMode,
  );
  const categoriesReducer = useSelector(
    (state) => state.categoryReducers.categories,
  );
  const productsReducer = useSelector(
    (state) => state.productReducers.products,
  );
  const currency = useSelector((state) => state.settingReducers.currency);
  const allCategories = categoriesReducer.result;

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (isEditing) {
      if (productsReducer.status === 'success') {
        setIsEditing(false);
        editProductSuccess();
      }
      if (productsReducer.status === 'error') {
        setIsEditing(false);
        editProductFail();
      }
    }
  }, [productsReducer]);

  const getCategories = () => {
    if (allCategories.length > 0) return;
    dispatch(ActionCreators.getCategories());
  };

  const showImagePicker = () => {
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        setPhotos([...photos, response.uri]);
      }
    });
  };

  const editProductSuccess = () => {
    dropdownAlertRef.current.alertWithType(
      'success',
      'Success',
      'Update product success.',
      {},
      CLOSE_INTERVAL_ALERT_SUCCESS,
    );
    const refreshProductData = navigation.getParam('refreshData');
    const newData = productsReducer.result.filter(
      (item) => item.id === product.id,
    );
    refreshProductData(newData[0]);
    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  };

  const editProductFail = () => {
    dropdownAlertRef.current.alertWithType(
      'error',
      'Error',
      productsReducer.error,
      {},
      CLOSE_INTERVAL_ALERT_ERROR,
    );
  };

  const handleEditProduct = async () => {
    const {editProduct, saveProductEditing} = ActionCreators;
    try {
      setIsEditing(true);

      if (validator.isEmpty(name.trim())) {
        throw 'Please input name of product.';
      }

      if (!regularPrice || !validator.isFloat(regularPrice)) {
        throw 'Please enter regular price is number.';
      }

      if (salePrice && !validator.isFloat(regularPrice)) {
        throw 'Please enter sale price is number.';
      }

      const params = {
        sku: sku.trim(),
        name: name.trim(),
        id: product.id,
        description: desc.trim(),
        sale_price: salePrice,
        regular_price: regularPrice,
      };
      if (category) {
        const selectedCategory = allCategories.filter(
          (item) => item.id === category,
        );
        params.category = selectedCategory[0];
      }

      const localImages = photos.filter((uri) => uri.indexOf('http') !== 0);
      let images = photos.filter((uri) => uri.indexOf('http') === 0);
      if (localImages.length > 0) {
        const compressImages = await Promise.all(
          localImages.map(async (uri) => {
            const fileUri = await Utils.compressImage({imageUri: uri});
            return fileUri;
          }),
        );
        images = [...images, ...compressImages];
      }

      if (`${product.id}`.includes('local-')) {
        return dispatch(saveProductEditing({...params, images}));
      }
      if (isOfflineMode) {
        return dispatch(
          saveProductEditing({...params, images, status: 'editing'}),
        );
      }

      let uploadedImageUris = images.filter(
        (item) => item.indexOf('http') === 0,
      );
      uploadedImageUris = uploadedImageUris.map((uri) => {
        const item = product.images.find((p) => p.src === uri);
        if (item) {
          return {id: item.id};
        } else {
          return {id: uri};
        }
      });

      if (localImages.length > 0) {
        const compressImageUris = images.filter(
          (item) => item.indexOf('http') !== 0,
        );
        const uploadResult = await Promise.all(
          compressImageUris.map(async (uri) => {
            const imageUploaded = await ImageServices.uploadImage({uri});
            return {id: imageUploaded.id};
          }),
        );
        images = [...uploadedImageUris, ...uploadResult];
      } else {
        images = uploadedImageUris;
      }
      if (category) {
        params.category = category;
      }
      dispatch(editProduct({...params, images}));
    } catch (error) {
      dropdownAlertRef.current.alertWithType(
        'error',
        'Error',
        error,
        {},
        CLOSE_INTERVAL_ALERT_ERROR,
      );
      setIsEditing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headContainer}>
        <TouchableOpacity
          style={styles.btnBack}
          onPress={() => navigation.goBack()}>
          <Text style={styles.lbBack}>{I18n.t('editProducts.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{I18n.t('editProducts.title')}</Text>
      </View>
      <KeyboardAwareScrollView enableResetScrollToCoords enableOnAndroid>
        <View style={styles.mainContainer}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.inputLabel}>
                {I18n.t('editProducts.productName')}
              </Text>
              <TextInput
                value={name}
                isDarkMode={isDarkMode}
                placeholder="Flower cup"
                onChangeText={setName}
              />
            </View>
            <View style={styles.inputSkuWrapper}>
              <Text style={styles.inputLabel}>
                {I18n.t('editProducts.sku')}*
              </Text>
              <TextInput
                value={sku}
                isDarkMode={isDarkMode}
                placeholder="SKU30001"
                onChangeText={setSku}
              />
            </View>
          </View>
          <Text style={styles.inputLabel}>
            {I18n.t('editProducts.chooseCategory')}
          </Text>
          <Dropdown
            data={allCategories.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
            fontSize={ResponsiveUtils.normalize(14)}
            renderBase={({title}) => (
              <View style={styles.btnSelect} elevation={1}>
                <Text style={styles.selectValue}>
                  {title || I18n.t('editProducts.selectCategory')}
                </Text>
                <Image
                  source={
                    isDarkMode
                      ? require('@assets/icons/ic_arrow_right.png')
                      : require('@assets/icons/ic_arrow_right_black.png')
                  }
                  style={styles.icArrowRight}
                />
              </View>
            )}
            pickerStyle={styles.pickerStyle}
            textColor={
              isDarkMode
                ? Colors.primaryTextColor.dark
                : Colors.primaryTextColor.light
            }
            // itemColor={isDarkMode ? Colors.primaryTextColor.light : Colors.primaryTextColor.dark}
            onChangeText={(value) => setCategory(value)}
            itemCount={6}
            value={category}
          />
          <Text style={styles.inputLabel}>
            {I18n.t('editProducts.description')}
          </Text>
          <TextInput
            isDarkMode={isDarkMode}
            style={styles.textArea}
            multiline
            value={desc}
            onChangeText={setDesc}
          />
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.inputLabel}>
                {I18n.t('editProducts.salePrice')}*
              </Text>
              <TextInput
                value={salePrice}
                isDarkMode={isDarkMode}
                placeholder={Utils.formatCurrency(20.8, currency)}
                keyboardType="number-pad"
                onChangeText={setSalePrice}
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.inputLabel}>
                {I18n.t('editProducts.regularPrice')}*
              </Text>
              <TextInput
                value={regularPrice}
                isDarkMode={isDarkMode}
                placeholder={Utils.formatCurrency(24.0, currency)}
                keyboardType="number-pad"
                onChangeText={setRegularPrice}
              />
            </View>
          </View>
          <Text style={styles.inputLabel}>
            {I18n.t('editProducts.addImage')}
          </Text>
          <View style={styles.imagesContainer}>
            <TouchableOpacity
              style={[styles.imageWrapper, styles.btnAddImage]}
              onPress={showImagePicker}>
              <Image
                source={require('@assets/icons/ic_add_photo.png')}
                style={styles.icAddPhoto}
              />
            </TouchableOpacity>
            {photos.map((uri, index) => (
              <View style={styles.imageWrapper} key={index.toString()}>
                <Image source={{uri}} style={styles.categoryImage} />
                <TouchableOpacity
                  onPress={() =>
                    setPhotos(photos.filter((item) => uri !== item))
                  }
                  style={styles.btnCloseImage}>
                  <View style={styles.icCloseCircle}>
                    <Image
                      source={require('@assets/icons/ic_close_circle.png')}
                      style={styles.icCloseImage}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity
            disabled={isEditing}
            style={styles.btnAddNew}
            onPress={handleEditProduct}>
            {isEditing ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.lbAddNew}>
                {I18n.t('editProducts.saveProduct')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      <DropdownAlert ref={dropdownAlertRef} updateStatusBar={false} />
    </View>
  );
};

export default EditProduct;
